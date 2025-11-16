import { matchUrl } from "@/lib/match-url"
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

function handlePotentialNavigation() {
  const currentUrl = window.location.href
  if (currentUrl === lastKnownUrl) return
  lastKnownUrl = currentUrl
  renderRules()
}

export async function renderRules() {
  const rules = await listRules()
  rules.forEach((rule) => {
    if (!matchUrl(rule.url, window.location.href)) return
    if (rule.enabled) {
      renderRule(rule)
    } else {
      removeRule(rule)
    }
  })

  const ruleIds = rules
    .filter((rule) => matchUrl(rule.url, window.location.href))
    .map((rule) => `${stylePrefix}${rule.id}`)
  const elements = document.querySelectorAll(`[id^="${stylePrefix}"]`)
  elements.forEach((element) => {
    if (!ruleIds.includes(element.id)) {
      element.remove()
    }
  })
}

export function renderRule(rule: Rule) {
  const style = document.getElementById(`${stylePrefix}${rule.id}`)
  if (style) {
    style.textContent = `/* ${rule.name} */\n${rule.selector} {\n${rule.style}\n}`
    return
  } else {
    const style = document.createElement("style")
    style.id = `${stylePrefix}${rule.id}`
    style.textContent = `/* ${rule.name} */\n${rule.selector} {\n${rule.style}\n}`
    document.head.appendChild(style)
  }
}

export function removeRule(rule: Rule) {
  const style = document.getElementById(`${stylePrefix}${rule.id}`)
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
