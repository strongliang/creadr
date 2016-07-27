'use strict';

var toggle = false;

chrome.browserAction.onClicked.addListener(ajaxTest);
function ajaxTest(tab) {
    // console.log(msg);
    // console.log('lala');
    chrome.tabs.sendMessage(
        tab.id, {text: 'report_back'},
        function(domContent) {
            console.log('got dom');
            // console.log(domContent);
        }
    );
}
// Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(colorShifter);

function colorShifter(tab) {
    // No tabs or host permissions needed!
    console.log('Turning ' + tab.url + ' ' + toggle);
    if (!toggle) {
        chrome.tabs.executeScript({
            code: 'document.body.style.backgroundColor="cyan"'
        });
    } else {
        chrome.tabs.executeScript({
            code: 'document.body.style.backgroundColor="white"'
        });
    }
    toggle = !toggle;
}
