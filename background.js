chrome.runtime.onMessage.addListener(async (request, sender) => {
  switch (request.message) {
    case 'closeTab':
      chrome.tabs.remove(sender.tab.id);
      break;
    case 'logError':
      if (sender.tab) {
        chrome.tabs.reload(sender.tab.id);
        console.log(`Error occurred: ${request.error}`);
      }
      break;
    default:
      console.log(`Unknown message: ${request.message}`);
  }
});