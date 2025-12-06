chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "download") {
    chrome.downloads.download(
      {
        url: request.url,
        filename: request.filename,
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ downloadId });
        }
      },
    );
    return true; // Keep the message channel open for async response
  }

  if (request.action === "openOptionsPage") {
    chrome.runtime.openOptionsPage();
    return true;
  }
});
