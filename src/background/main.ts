chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  const { sidePanel, action } = chrome
  if (sidePanel && sidePanel.setPanelBehavior) {
    sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {})
  } else if (action && sidePanel) {
    action.onClicked.addListener((tab) => {
      if (!tab?.id) return
      sidePanel.open({ tabId: tab.id }).catch(() => {})
    })
  } else {
    console.error('sidePanel or action is not available')
  }
})
