let recordBtn = document.querySelector('#record');
const video = document.querySelector('#mainVideo');
const img = document.querySelector('#screenshot');
const p = document.querySelector('#text');
const a = document.querySelector('#download');

recordBtn.onclick = function onRecordClicked() {
  chrome.desktopCapture.chooseDesktopMedia(['tab', 'window'], accessToRecord);
}

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
           .then((s) => startStream(s))
           .catch(function (err) {
             console.log(err.name + ": " + err.message);
           }); // always check for errors at the end.

}


async function startStream(mediaStream) {
  console.log('stream started', mediaStream);
  video.srcObject = mediaStream;
  video.onloadedmetadata = function (e) {
    video.play();
  };

  await newCapture(mediaStream);
  download(img);

  mediaStream.onended = function videoMediaStreamEnded() {
    console.log('media stream ended!');
  }
}

async function newCapture(mediaStream) {
  const mediaStreamTrack = mediaStream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(mediaStreamTrack);
  const {width, height} = mediaStreamTrack.getSettings();
  const osc = new OffscreenCanvas(width, height);
  const osctx = osc.getContext("2d");
  const imageBitmap = await imageCapture.grabFrame();
  osctx.drawImage(imageBitmap, 0, 0);
  img.src = URL.createObjectURL(await osc.convertToBlob({type: "image/png"}));
  imageBitmap.close();
}

function download(img) {
  a.href = img.src;
  a.click();
}
