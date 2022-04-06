const {
  StreamingSdk
} = meshstreamSdk
const peerId = Math.random().toString(36).substr(2, 8);
const $ = document.querySelector.bind(document);

let streamingSdk;

const serverUrl = "https://meshstream-server-back.meshstream.io";

main();

function main(){
  streamingSdk = new StreamingSdk({ peerId, serverUrl });

  streamingSdk
    .on('joinEvent:error', ({ error }) => {
      alert(error);
    })
    .on('joinInfo', async (joinInfo) => {
      console.log(joinInfo);
      alert("Join event successfully");
      $('#btn-joinEvent').disabled = true;
      $('#btn-checkStatusByStreamName').disabled = false;
      $('#btn-publish').disabled = false;
      $('#btn-fileStreaming').disabled = false;
      $('#btn-subscribe').disabled = false;
      $('#btn-recording').disabled = false;
      $('#btn-finishRecording').disabled = false;
    })
    .on('publishingStream', async ({ streamName }) => {
      console.log("A stream is published", streamName);
    })
    .on('streamEnded', async ({ streamName }) => {
      removeRemoteMedia(streamName);
      await streamingSdk.unsubscribe({ streamName })
    })

  $('#btn-createEvent').addEventListener('click', async () => {
    const title = $('#input-title').value.trim();
    const description = $('#input-description').value.trim();
    if(!title || !description) {
      alert("title and description shouldn't be empty");
      return;
    }

    const startedAt = new Date(); // You can also define a time later than the current one
    startedAt.setSeconds(startedAt.getSeconds() + 5);
    const { success, message, eventId } = await streamingSdk.createEvent({ title, description, startedAt });
    if(!success) {
      alert(`create event error: ${message}`);
      return;
    }

    $('#input-title').value = null;
    $('#input-description').value = null;
    alert(`create an event successfully: ${eventId}`);

  })

  $('#btn-joinEvent').addEventListener('click', async () => {
    const eventId = $('#input-eventId').value.trim();
    if(!eventId) {
      alert("publish streamName shouldn't be empty");
      return;
    }
    await streamingSdk.joinEvent({ eventId });
    // If success, the joinInfo will be sent to the eventListener in streamingSdk
  })

  $('#btn-checkStatusByStreamName').addEventListener('click', async () => {
    const streamName = $('#input-publish-streamName').value.trim();
    if(!streamName) {
      alert("publish streamName shouldn't be empty");
      return;
    }

    const { isPublished } = await streamingSdk.checkStatusByStreamName({ streamName });

    isPublished ?
      alert("The streamName is already published!") :
      alert("The streamName is not published yet.")
  })

  $('#btn-publish').addEventListener('click', async () => {
    const streamName = $('#input-publish-streamName').value.trim();
    if(!streamName) {
      alert("publish streamName shouldn't be empty");
      return;
    }
    $('#input-publish-streamName').value = null;
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true 
    });

    const type = 'rtc';
    const { success, error } = await streamingSdk.publish({ type, streamName, mediaStream });
    if(!success){
      alert(`Publish error: ${error}`);
      return;
    }
    alert("Publish successfully!");
    $('#video-local').srcObject = mediaStream;
  })
  
  $('#btn-fileStreaming').addEventListener('click', async () => {
    const streamName = $('#input-publish-streamName').value.trim();
    if(!streamName) {
      alert("publish streamName shouldn't be empty");
      return;
    }
    $('#input-publish-streamName').value = null;

    const type = 'file';
    const options = {
      url: "https://meshstream-server-back.meshstream.io/fps-test.mp4"
    };
    const { success, error } = await streamingSdk.publish({ type, streamName, options });
    if(!success){
      alert(`file streaming error: ${error}`);
      return;
    }
    alert("file streaming successfully!");
  })

  $('#btn-subscribe').addEventListener('click', async () => {
    const streamName = $('#input-subscribe-streamName').value.trim();
    if(!streamName) {
      alert("subscribe streamName shouldn't be empty");
      return;
    }

    $('#input-subscribe-streamName').value = null;
    const { success, error, mediaStream } = await streamingSdk.subscribe({ streamName });
    console.log({ success, error, mediaStream })
    if(!success){
      alert(`subscribe error: ${error}`);
      return;
    }

    console.log(mediaStream);
    addRemoteMedia(mediaStream, streamName);
  })

  $("#btn-recording").addEventListener('click', async () => {
    const streamName = $('#input-recording-streamName').value.trim();
    if(!streamName) {
      alert("recording streamName shouldn't be empty");
      return;
    }

    $('#input-recording-streamName').value = null;

    const { success, error } = await streamingSdk.startRecording({ streamName });
    if(!success) {
      alert(`recording error: ${error}`);
      return;
    }

    alert("recording successfully");
  })


  $("#btn-finishRecording").addEventListener('click', async () => {
    const streamName = $('#input-recording-streamName').value.trim();
    if(!streamName) {
      alert("recording streamName shouldn't be empty");
      return;
    }

    $('#input-recording-streamName').value = null;

    const isDownload = true;
    const { success, error, downloadLink } = await streamingSdk.finishRecording({ streamName, isDownload });
    if(!success) {
      alert(`finish recording error: ${error}`);
      return;
    }

    alert("finish recording successfully");
    if(downloadLink) $("#downloadLink").innerText = downloadLink;
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