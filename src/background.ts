chrome.browserAction.onClicked.addListener(function(tab) {
  const url: string = "https://www.youtube.com";
  chrome.tabs.create({ url: url });
});
