'use strict';

chrome.runtime.onInstalled.addListener(function () {

  chrome.storage.sync.set({interval: 60000 * 5}, function () {
    console.log("Default - interval set to 5min");
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          urlMatches: '.*'
        },
      })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

});

/*
chrome.app.runtime.onLaunched.addListener(function() {

  chrome.storage.sync.set({interval: 60000 * 2}, function() {
    console.log("interval set to 2min");
  });

  chrome.app.window.create('window.html', {
    'outerBounds': {
      'width': 1000,
      'height': 800
    }
  });

});
*/

var win;
var latestPort;

chrome.runtime.onConnect.addListener(function (port) {
  latestPort = port;
  console.log('on connect called');
  port.onMessage.addListener(function (message) {

    switch (message) {
      case 'record':
        start();
        break;
      case 'deRecord':
        stop();
        break;
      case 'status':
        statusReply(port)
        break;
      default:
        console.log('this is not handled', message);
    }
  });
});

function statusReply(port) {

  chrome.storage.sync.get(null, function (items) {
    port.postMessage({id: 'status-reply', data: items});
  });

}

function start() {
  console.log('started');

  chrome.storage.sync.get(null, function (items) {
    const isRecording = items.isRecording;

    if (!isRecording) {
      // win = window.open("main.html", "_blank",
      //     "top=0,left=0,width=" + screen.width + ",height=" + screen.height);
      chrome.storage.sync.set({
        isRecording: true
      });

      win = window.open("main.html", "_blank",
          "top=0,left=0,width=" + 570 + ",height=" + 600);


      var timer = setInterval(function () {
        if (win.closed) {
          console.log('window closed, executing clean up..');
          setDefaults();
          statusReply(latestPort);
          clearInterval(timer);
        }
      }, 1000);

    }
  });
}

function stop() {
  chrome.storage.sync.get(null, function (items) {
    const isRecording = items.isRecording;
    if (isRecording) {
      console.log('stop executing..');
      win.close();
      setDefaults();
    }
  });

}

function setDefaults() {
  chrome.storage.sync.set({
    isRecording: false,
    lastClickAt: null
  });
}
