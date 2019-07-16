chrome.browserAction.onClicked.addListener(function() {
  const url: string = "https://www.youtube.com";
  chrome.tabs.create({ url: url });
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    title: "Open Youtube Caption Display Board",
    id: "open_display_board",
    documentUrlPatterns: ["http://*.youtube.com/*", "https://*.youtube.com/*"]
  });
});

chrome.contextMenus.onClicked.addListener(function() {
  chrome.tabs.create(
    {
      url: chrome.extension.getURL("html/index.html"),
      active: false //trueにすると右端のタブに画面が切り替わってしまう
    },
    function(tab) {
      openWindow(tab);
    }
  );
});

function openWindow(tab: chrome.tabs.Tab) {
  chrome.windows.create({
    tabId: tab.id,
    type: "popup",
    focused: false,
    left: Math.round((window.screen.width - 347) / 2),
    top: Math.round((window.screen.height - 453) / 2),
    width: 347,
    height: 453
  });
}
