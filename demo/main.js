const {
  StreamingSdk
} = meshstreamSdk
const peerId = Math.random().toString(36).substr(2, 8);
const $ = document.querySelector.bind(document);

let streamingSdk;

const serverUrl = "wss://meshstream-server.meshstream.io";

main();

function main(){
  streamingSdk = new StreamingSdk({ peerId, serverUrl });

  streamingSdk.on('streamEnded', async ({ streamName }) => {
    removeRemoteMedia(streamName);
    await streamingSdk.unsubscribe({ streamName })
  })

  $('#btn-publish').addEventListener('click', async () => {
    const streamName = $('#input-publish-streamName').value.trim();
    if(!streamName) {
      alert("publish streamName shouldn't be empty");
      return;
    }

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true 
    });

    const result = await streamingSdk.publish({ streamName, mediaStream });
    console.log(result);
    // if(!success){
    //   alert("Publish error:", error);
    //   return;
    // }
    // alert("Publish successfully!");
    $('#video-local').srcObject = mediaStream;
  })
  
  $('#btn-subscribe').addEventListener('click', async () => {

    const streamName = $('#input-subscribe-streamName').value.trim();
    if(!streamName) {
      alert("subscribe streamName shouldn't be empty");
      return;
    }

    const { success, error, mediaStream } = await streamingSdk.subscribe({ streamName });
    console.log({ success, error, mediaStream })
    if(!success){
      alert("subscribe error:", error);
      return;
    }

    console.log(mediaStream);
    addRemoteMedia(mediaStream, streamName);
  })
}

function addRemoteMedia(mediaStream, streamName){
  let videoContainer = document.getElementById(`container-${streamName}`);
  if(!videoContainer){
    videoContainer = document.createElement('div');
    videoContainer.classList.add('container');
    videoContainer.setAttribute("id", `container-${streamName}`);
    $('#remote-videos').appendChild(videoContainer);
  }

  let videoRemote = document.getElementById(`video-${streamName}`);
  if(!videoRemote){
    const remoteVideoTag = document.createElement('video');
    remoteVideoTag.setAttribute("id", `video-${streamName}`);
    remoteVideoTag.setAttribute("width", "40%");
    remoteVideoTag.setAttribute("autoplay", "");
    remoteVideoTag.setAttribute("playsinline", "");
    remoteVideoTag.setAttribute("controls", "");
    videoContainer.appendChild(remoteVideoTag);
    videoRemote = document.getElementById(`video-${streamName}`);
  }
  videoRemote.srcObject = mediaStream;
  
  const overlayDiv = document.createElement('div');
  overlayDiv.classList.add('overlayText');
  const displayNameText = document.createElement('p');
  displayNameText.innerHTML = streamName;
  overlayDiv.appendChild(displayNameText);
  videoContainer.appendChild(overlayDiv);
}

function removeRemoteMedia(streamName){
  console.log("removeRemoteMedia:", streamName)
  const videoElement = document.getElementById(`container-${streamName}`);
  if(videoElement) videoElement.remove();
}