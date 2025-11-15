chrome.runtime.onInstalled.addListener(() => {
  console.log("background installed")
  const { sidePanel, action } = chrome
  if (sidePanel?.setPanelBehavior) {
    sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {})
  } else if (action && sidePanel) {
    action.onClicked.addListener((tab) => {
      if (!tab?.id) return
      sidePanel.open({ tabId: tab.id }).catch(() => {})
    })
  } else {
    console.error("sidePanel or action is not available")
  }
})

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request === "GET_ACTIVE_TAB") {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      (tabs) => {
        const tab = tabs[0]
        if (!tab) return
        sendResponse({ tabId: tab.id, url: tab.url })
      },
    )
  }
  return true
})
