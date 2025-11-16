chrome.runtime.onInstalled.addListener(() => {
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
