const {
    ConferenceApi,
    Utils,
} = meshstreamClient;

//Arguments for ConferenceApi 
const AUTH_URL = 'https://q74eu8nozk.execute-api.us-east-1.amazonaws.com/v1/auth?token=PLACEHOLDER';
const kinds = ['audio', 'video'];
const worker = 0;

let stream_w = 0;
let stream_h = 0;

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

    if (Utils.isSafari) {
        const onStreamChange = () => {
            videoElement.srcObject = new MediaStream(mediaStream.getTracks());
            play();
        };
        if (conferenceApi != null) {
            conferenceApi
                .on('addtrack', onStreamChange)
                .on('removetrack', onStreamChange);
        }

    } else if (Utils.isFirefox) {
        videoElement.addEventListener('pause', play)
    }
    play();

}

async function change_res(w, h) {
    try {
        console.log(`change res:${w}x${h}`)
        let video_local = document.getElementById("video-local");
        navigator.mediaDevices.getUserMedia({
            video: {
                width: { exact: w },
                height: { exact: h },
                facingMode: 'environment'
            },
            audio: true
        }).then(stream => {
            mediaStream = stream
            attachMediaStreamToVideoElement(null, mediaStream, video_local);
            stream_w = w;
            stream_h = h;
        }).catch(err => {
            alert(err);
        });
    }
    catch (err) {
        alert(`change_res error:${err}`);
    }
}

$(document).ready(async function () {

    $('#btn_change_res_1920').click(async function () {
        await change_res(1920, 1080);
    });

    $('#btn_change_res_1280').click(async function () {
        await change_res(1280, 720);
    });

    $('#btn_change_res_320').click(async function () {
        await change_res(320, 240);
    });


    $('#btn_publish').click(async function () {
        console.log(`will publish`)
        let api_response = await fetch(AUTH_URL, {});
        let api_result = await api_response.json();
        const capture = new ConferenceApi({
            kinds: kinds,
            url: api_result.url,
            worker: worker,
            stream: api_result.streamName,
            token: api_result.apiToken
        });

        try {
            await capture.publish(mediaStream);
            alert(`publish ${stream_w}x${stream_h} to ${api_result.url} success`)
        } catch (err) {
            console.log(err);
            alert(`Publish error:${err}`);
        }
    });

    $('#btn_subscribe').click(async function () {
        console.log('will subscribe')
        let api_response = await fetch(AUTH_URL, {});
        let api_result = await api_response.json();
        const playback = new ConferenceApi({
            kinds: kinds,
            url: api_result.url,
            worker: worker,
            stream: api_result.streamName,
            token: api_result.apiToken
        });
        const v = document.getElementById("video-remote");

        try {
            const mediaStream = await playback.subscribe();
            attachMediaStreamToVideoElement(playback, mediaStream, v);
        } catch (err) {
            alert(`Subscribe error:${err}`);
        }
    });
    await change_res(1280, 720);
});
