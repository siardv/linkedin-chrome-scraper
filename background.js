chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.message === "closeTab") {
    chrome.tabs.remove(sender.tab.id);
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "logError") {
    document.location.reload(true);
    console.log("Error occurred:", request.error);
  }
});

chrome.tabs.onZoomChange.addListener(({ tabId, newZoomFactor }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (
      new URL(tab.url).hostname === "www.linkedin.com" &&
      newZoomFactor > 0.9
    ) {
      chrome.tabs.setZoom(tabId, 0.1);
      console.log(`Zoom level adjusted for tabId: ${tabId}`);
    }
  });
});

