console.log("Content script loaded!");


// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "tabActivated") {
    console.log("收到来自 background 的消息：", request.preload);


    // 回复消息
    sendResponse({ reply: "Tab activation handled by content script!" });
  }
});
