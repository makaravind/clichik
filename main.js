const video = document.querySelector('#mainVideo');
const img = document.querySelector('#screenshot');
const a = document.querySelector('#download');
const deRecordBtn = document.querySelector('#deRecord');

const sessionState = {
  intervalId: null,
  mediaStream: null,
}

function kickOff() {
  console.log('kicking off...');
  chrome.desktopCapture.chooseDesktopMedia(['tab', 'window'], accessToRecord);
}

kickOff();

function accessToRecord(id) {
  if (!id) {
    console.log('Access rejected.');
    return;
  }

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: id
      }
    }
  };

  console.log('starting user media access');
  navigator.mediaDevices.getUserMedia(constraints)
           .then((s) => {
             sessionState.mediaStream = s;
             return startStream(s)
           })
           .catch(function (err) {
             console.log(err.name + ": " + err.message);
           }); // always check for errors at the end.

}

async function startStream(mediaStream) {
  console.log('stream started', mediaStream);
  video.srcObject = mediaStream;
  video.onloadedmetadata = async function (e) {
    video.play();
  };
  chrome.storage.sync.get('interval', function ({interval}) {
    console.log('capturing clicks every ', interval);
    sessionState.intervalId = startSession(video, mediaStream, interval);
  });

  mediaStream.onended = function videoMediaStreamEnded() {
    console.log('media stream ended!');
    clearInterval(sessionState.intervalId);
  }
}

function startSession(video, mediaStream, interval) {
  return setInterval(async function sessionStarted() {
    const blob = await newCaptureCanvas(video);
    img.src = URL.createObjectURL(blob);
    console.log('downloading image');
    download(img);
  }, interval);
}

async function newCaptureCanvas(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    try {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob(resolve, 'image/png');
    } catch (e) {
      reject(e);
    }
  });

}

function download(img) {
  const options = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  };
  let clickName = new Intl.DateTimeFormat('en-US', options).format(new Date());
  let timestamp = new Date().getTime();
  a.href = img.src;
  a.download = `click_session_${clickName}`;
  a.click();

  chrome.storage.sync.set({
    lastClickAt: timestamp,
  });
}

deRecordBtn.onclick = function stopRecord() {
  console.log('stop recording');
  const mediaStreamTrack = sessionState.mediaStream.getVideoTracks()[0];
  mediaStreamTrack.enabled = false;
  mediaStreamTrack.stop();
  clearInterval(sessionState.intervalId);
  window.close();
}
