let recordBtn = document.querySelector('#record');
let deRecordBtn = document.querySelector('#deRecord');
let p = document.querySelector('#info');

var port = chrome.runtime.connect();

recordBtn.onclick = function () {
  port.postMessage('record');
}

deRecordBtn.onclick = function () {
  port.postMessage('deRecord');
}

port.onMessage.addListener(function (data) {

  switch (data.id) {
    case 'status-reply':
      console.log('data got', data);
      data.data.isRecording ? alreadyRecording(data.data.lastClickAt)
          : allowRecording();
      break;
    default:
      console.log('this is on my html?', data);
  }

});

function alreadyRecording(lastClickAt) {
  console.log('alreadyRecording');
  chrome.storage.sync.get(null, function ({interval}) {
    const d = lastClickAt ? new Date(lastClickAt) : new Date();
    d.setMilliseconds(d.getMilliseconds() + interval);
    const options = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false,
    };

    let newClickAt = new Intl.DateTimeFormat('en-US', options).format(d);
    p.innerHTML = 'Next click at ' + newClickAt;
  });
  recordBtn.disabled = true;
}

function allowRecording() {
  console.log('allowRecording');
  p.innerHTML = 'Start new session';
  recordBtn.disabled = false;
}

(function () {
  port.postMessage('status');
})();
