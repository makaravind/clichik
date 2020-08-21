let recordBtn = document.querySelector('#record');
let recordBtn2Min = document.querySelector('#record-2min');
let deRecordBtn = document.querySelector('#deRecord');
let p = document.querySelector('#info');

var port = chrome.runtime.connect();

recordBtn.onclick = function () {
  chrome.storage.sync.set({interval: 60000 * 5}, function () {
    console.log("interval set to 5min");
    port.postMessage('record');
  });
}

recordBtn2Min.onclick = function () {
  chrome.storage.sync.set({interval: 60000 * 2}, function () {
    console.log("interval set to 2min");
    port.postMessage('record');
  });
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
      hour: 'numeric', minute: 'numeric'
    };

    let newClickAt = new Intl.DateTimeFormat('en-US', options).format(d);
    p.innerHTML = 'Next click at ' + newClickAt;
  });
  disableRecordButtons();
}

function disableRecordButtons() {
  recordBtn.disabled = true;
  recordBtn2Min.disabled = true;
}

function allowRecording() {
  recordBtn.disabled = false;
  recordBtn2Min.disabled = false;
}

(function () {
  port.postMessage('status');
})();
