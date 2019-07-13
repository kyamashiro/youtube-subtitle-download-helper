"use strict";
chrome.browserAction.onClicked.addListener(function (tab) {
    var url = "https://www.youtube.com";
    chrome.tabs.create({ url: url });
});
