import { matchUrl } from "@/lib/match-url"
import { sendToRuntime } from "@/lib/messaging"
import type { Rule } from "@/types/types"

let lastKnownUrl: string | null = null
const stylePrefix = "stylish-rule-"

export function bootstrapRules() {
  renderRules()
  setupNavigationListeners()
}

function setupNavigationListeners() {
  const navEvents = ["popstate", "hashchange"]
  navEvents.forEach((evt) => {
    window.addEventListener(evt, handlePotentialNavigation)
  })

  const originalPushState = history.pushState
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args)
    handlePotentialNavigation()
    return result
  }

  const originalReplaceState = history.replaceState
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args)
    handlePotentialNavigation()
    return result
  }

  // In case the page manipulates history before we patch it, check once more.
  setInterval(handlePotentialNavigation, 500)
}

// 触发时机是为当前活跃 tab 的 URL 发生变化
function handlePotentialNavigation() {
  const currentUrl = window.location.href
  if (currentUrl === lastKnownUrl) return
  lastKnownUrl = currentUrl
  sendToRuntime({ type: "ROUTE_CHANGE", url: currentUrl }).catch(console.error)
  renderRules()
}

export async function renderRules() {
  const rules = await listRules()
  rules.forEach((rule) => {
    if (!matchUrl(rule.url, window.location.href)) return
    renderRule(rule)
  })

  const ruleIds = rules
    .filter((rule) => matchUrl(rule.url, window.location.href))
    .map((rule) => `${stylePrefix}${rule.id}`)
  ruleIds.push(`${stylePrefix}preview`)

  const elements = document.head.querySelectorAll(`[id^="${stylePrefix}"]`)
  elements.forEach((element) => {
    if (!ruleIds.includes(element.id)) {
      element.remove()
    }
  })
}

export function renderRule(rule: Rule) {
  const element = document.getElementById(`${stylePrefix}${rule.id}`)
  const style = rule.enabled ? rule.style : ""
  if (element) {
    element.textContent = `/* ${rule.name} */\n${rule.selector} {\n${style}\n}`
    return
  } else {
    const element = document.createElement("style")
    element.id = `${stylePrefix}${rule.id}`
    element.textContent = `/* ${rule.name} */\n${rule.selector} {\n${style}\n}`
    document.head.appendChild(element)
  }
}

export function removeRule(ruleId: string) {
  const style = document.getElementById(`${stylePrefix}${ruleId}`)
  if (style) {
    style.remove()
  }
}

function listRules(): Promise<Rule[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({ rules: [] }, (data) => {
      const err = chrome.runtime.lastError
      if (err) {
        reject(err)
        return
      }
      const rules = Array.isArray(data.rules) ? data.rules : []
      resolve(rules)
    })
  })
}
