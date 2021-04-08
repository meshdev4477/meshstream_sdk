const {
    ConferenceApi,
    Utils,
} = meshstreamClient;

const kinds = ['audio', 'video'];

let mediaStream = null;
let stream_w = 0;
let stream_h = 0;
let capture = null; // for publish
let playback = null; // for subscribe

function attachMediaStreamToVideoElement(conferenceApi, mediaStream, videoElement) {
    const play = () => {
        let playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => { }).catch(error => {
                videoElement.muted = true;
                videoElement.play().then(() => {
                    console.log('errorAutoPlayCallback OK');
                }, (error) => {
                    console.log('errorAutoPlayCallback error again');
                });
            });
        }
    };
    videoElement.srcObject = mediaStream;

    if (meshstreamClient.Utils.isSafari) {
        const onStreamChange = () => {
            videoElement.srcObject = new MediaStream(mediaStream.getTracks());
            play();
        };
        if (conferenceApi != null) {
            conferenceApi
                .on('addtrack', (track) => {
                    console.log("Track added");
                    console.log(track);
                    onStreamChange()
                })
                .on('removetrack', (track) => {
                    console.log("Track removed");
                    console.log(track);
                    onStreamChange()
                })
        }

    } else if (meshstreamClient.Utils.isFirefox) {
        videoElement.addEventListener('pause', play)
    }
    play();

}

async function init_video(w, h) {
    try {
        console.log(`change res:${w}x${h}`)
        let video_local = document.getElementById("video-local");
        mediaStream = await Utils.getUserMedia({
            video: {
                width: { exact: w },
                height: { exact: h },
                facingMode: 'environment'
            },
            audio: true
        });
        attachMediaStreamToVideoElement(null, mediaStream, video_local);
        stream_w = w;
        stream_h = h;
    }
    catch (err) {
        alert(`init_video error:${err}`);
    }

}

async function changeExistingLocalVideoSolution(w, h){
    try {
        let videoLocal = document.getElementById("video-local");
        const videoTrack = videoLocal.srcObject.getVideoTracks()[0];
        await videoTrack.applyConstraints({
            width  : { exact: w },
            height : { exact: h }
        });
        const stream = new MediaStream();
        stream.addTrack(videoTrack);
        videoLocal.srcObject = stream;
        
    } catch (err) {
        alert(`changeExistingLocalVideoSolution error:${err}`);
    }
}

async function getSdkConfig(operation, stream){
    const result =  await fetch('[API_URL]', {
        method: "POST",
        body: JSON.stringify({ operation, stream }),
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [authorization token]'
        })
    });

    return result.json();
}

$(document).ready(async function () {

    await init_video(1280, 720);

    $('#btn_change_res_3840').click(async function () {
        await changeExistingLocalVideoSolution(3840, 2160);
    });

    $('#btn_change_res_1920').click(async function () {
        await changeExistingLocalVideoSolution(1920, 1080);
    });

    $('#btn_change_res_1280').click(async function () {
        await changeExistingLocalVideoSolution(1280, 720);
    });

    $('#btn_change_res_320').click(async function () {
        await changeExistingLocalVideoSolution(320, 240);
    });

    $('#btn_change_res_80').click(async function () {
        await changeExistingLocalVideoSolution(80, 60);
    });


    $('#btn_publish').click(async function () {
        console.log(`will publish`)

        $('#publishStreamId').text(Math.random().toString(36).substring(5));
        const sdkConfig = await getSdkConfig(1, $('#publishStreamId').text());
        console.log(sdkConfig);

        capture = new ConferenceApi({
            kinds,
            url: sdkConfig.config.url,
            worker: sdkConfig.config.worker,
            stream: sdkConfig.config.stream,
            token: sdkConfig.config.token
        });

        try {
            await capture.publish(mediaStream);
            alert(`publish ${stream_w}x${stream_h} to ${sdkConfig.config.url} success`)
            capture.on('getstats', (result) => {
                // console.log(result);
                if(result.kind == 'video'){
                    $("#getstats-publish").text(JSON.stringify(result, null, 4));
                }

                if(result.kind == 'audio'){
                    $("#getstats-publish-audio").text(JSON.stringify(result, null, 4));
                }
            })
        } catch (err) {
            console.log(err);
            alert(`Publish error:${err}`);
        }
    });

    $('#btn_subscribe').click(async function () {
        console.log('will subscribe')
        
        const subscribeStreamId = $('#subscribeStreamId').val();
        const sdkConfig = await getSdkConfig(0, subscribeStreamId);
        console.log(sdkConfig);

        playback = new ConferenceApi({
            kinds,
            origin: sdkConfig.config.origin,
            url: sdkConfig.config.url,
            worker: sdkConfig.config.worker,
            stream: sdkConfig.config.stream,
            token: sdkConfig.config.token
        });
        const v = document.getElementById("video-remote");

        try {
            const mediaStream = await playback.subscribe();
            attachMediaStreamToVideoElement(playback, mediaStream, v);
            playback.on('getstats', (result) => {
                if(result.kind == 'video'){
                    $("#getstats-subscribe").text(JSON.stringify(result, null, 4));
                }

                if(result.kind == 'audio'){
                    $("#getstats-subscribe-audio").text(JSON.stringify(result, null, 4));
                }
            })
        } catch (err) {
            console.log(err);
            alert(`Subscribe error:${err}`);
        }
    });

    $('#btn_unsubscribe').click(async function() {
        console.log("Will unsubscribe");
        await playback.unsubscribeTrack('video');
        await playback.unsubscribeTrack('audio');
        const v = document.getElementById("video-remote");
        v.srcObject = null;
    });
});
