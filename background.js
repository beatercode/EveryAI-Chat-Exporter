var AIChatExportID = "AIChatExportID_2711" + Math.random().toString(36).substring(2, 9);

var contextMenuItem = {
  id: AIChatExportID,
  title: "Export Conversation",
  contexts: ["all"],
  targetUrlPatterns: ["https://*.gemini.google.com/*", "https://g.co/*"],
};

chrome.runtime.onInstalled.addListener(async () => {
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({ url: cs.matches })) {
      chrome.scripting.executeScript({
        files: cs.js,
        target: { tabId: tab.id, allFrames: cs.all_frames },
        injectImmediately: cs.run_at === "document_start",
      });
    }
  }
});

//on installation of chrome extension: create contextMenuItem
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(contextMenuItem);
});

//add listener for click on self defined menu item
chrome.contextMenus.onClicked.addListener(async function (clickData) {
  if (clickData.menuItemId == AIChatExportID) {
    try {
      const tab = await chrome.tabs.query({ active: true, currentWindow: true });

      // Send message to content script to trigger handleExportClick
      chrome.tabs.sendMessage(tab[0].id, "exportChat");
    } catch (error) {
      console.error("Error exporting chat:", error);
    }
  }
});
