import { sendToRuntime } from "@/lib/messaging"
import { getCssSelector } from "@/lib/selector"
import {
  bootstrapRules,
  removeRule,
  renderRule,
  renderRules,
} from "./apply-style"

const pickerState: {
  active: boolean
  highlight: HTMLDivElement | null
  label: HTMLDivElement | null
  status: HTMLDivElement | null
  listenersBound: boolean
  lastTarget: EventTarget | null
} = {
  active: false,
  highlight: null,
  label: null,
  status: null,
  listenersBound: false,
  lastTarget: null,
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapRules, { once: true })
} else {
  bootstrapRules()
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "START_PICKER") {
    startPicker()
  } else if (msg.type === "STOP_PICKER") {
    stopPicker()
  } else if (msg.type === "RENDER_RULES") {
    renderRules()
  } else if (msg.type === "PREVIEW_RULE") {
    renderRule(msg.rule)
  } else if (msg.type === "REMOVE_RULE") {
    removeRule(msg.id)
  }
  sendResponse(true)
})

function startPicker() {
  if (pickerState.active) {
    stopPicker()
  }

  pickerState.active = true
  pickerState.highlight = createHighlightElement()
  pickerState.label = createLabelElement()
  pickerState.status = createStatusElement()
  pickerState.status.textContent =
    "Please pick an element. Click to confirm. Press ESC to cancel."
  const mountTarget = document.body || document.documentElement
  mountTarget.append(
    pickerState.highlight,
    pickerState.label,
    pickerState.status,
  )

  if (!pickerState.listenersBound) {
    document.addEventListener("mousemove", handlePointerMove, true)
    document.addEventListener("mouseout", handlePointerOut, true)
    document.addEventListener("click", handlePickerClick, true)
    pickerState.listenersBound = true
  }
}

function stopPicker() {
  if (!pickerState.active) return
  pickerState.active = false

  if (pickerState.highlight) pickerState.highlight.remove()
  if (pickerState.label) pickerState.label.remove()
  if (pickerState.status) pickerState.status.remove()
  pickerState.highlight = null
  pickerState.label = null
  pickerState.status = null
  pickerState.lastTarget = null

  if (pickerState.listenersBound) {
    document.removeEventListener("mousemove", handlePointerMove, true)
    document.removeEventListener("mouseout", handlePointerOut, true)
    document.removeEventListener("click", handlePickerClick, true)
    pickerState.listenersBound = false
  }
}

function handlePointerMove(event: MouseEvent) {
  if (!pickerState.active) return
  const target = event.target
  if (!pickerState.highlight || !pickerState.label) return
  if (target === document.body || target === document.documentElement) {
    pickerState.highlight.style.display = "none"
    pickerState.label.style.display = "none"
    return
  }
  pickerState.lastTarget = target
  highlightElement(target as Element)
}

function handlePointerOut(event: MouseEvent) {
  if (!pickerState.active || event.relatedTarget === pickerState.lastTarget)
    return
  if (!pickerState.highlight || !pickerState.label) return
  pickerState.highlight.style.display = "none"
  pickerState.label.style.display = "none"
}

function highlightElement(element: Element) {
  if (
    !pickerState.highlight ||
    !pickerState.label ||
    !element.getBoundingClientRect
  )
    return
  const rect = element.getBoundingClientRect()
  pickerState.highlight.style.display = "block"
  pickerState.highlight.style.top = `${rect.top}px`
  pickerState.highlight.style.left = `${rect.left}px`
  pickerState.highlight.style.width = `${rect.width}px`
  pickerState.highlight.style.height = `${rect.height}px`

  pickerState.label.style.display = "block"
  pickerState.label.style.top = `${rect.top}px`
  pickerState.label.style.left = `${rect.left + rect.width / 2}px`
  pickerState.label.textContent = describeElement(element)
}

function handlePickerClick(event: MouseEvent) {
  if (!pickerState.active) return
  event.preventDefault()
  event.stopPropagation()
  const selector = getCssSelector(event.target as Element)
  sendToRuntime({
    type: "ELEMENT_PICKED",
    selector,
    url: window.location.href,
  }).catch((e) => {
    if (import.meta.env.DEV) {
      console.error("Failed to send element picked message:", e)
    }
  })
  stopPicker()
}

function describeElement(el: Element) {
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ""
  const className =
    el.className && typeof el.className === "string"
      ? `.${el.className.trim().replace(/\s+/g, ".")}`
      : ""
  return `${tag}${id}${className}`
}

function createHighlightElement() {
  const highlight = document.createElement("div")
  highlight.style.position = "fixed"
  highlight.style.border = "2px solid #0aa7ff"
  highlight.style.background = "rgba(10, 167, 255, 0.15)"
  highlight.style.pointerEvents = "none"
  highlight.style.zIndex = "2147483646"
  highlight.style.transition = "all 60ms ease-out"
  return highlight
}

function createLabelElement() {
  const label = document.createElement("div")
  label.style.position = "fixed"
  label.style.padding = "2px 6px"
  label.style.background = "#0aa7ff"
  label.style.color = "#fff"
  label.style.fontSize = "12px"
  label.style.fontFamily =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  label.style.borderRadius = "4px"
  label.style.pointerEvents = "none"
  label.style.zIndex = "2147483647"
  label.style.whiteSpace = "nowrap"
  label.style.transform = "translate(-50%, -160%)"
  return label
}

function createStatusElement() {
  const status = document.createElement("div")
  status.style.position = "fixed"
  status.style.left = "50%"
  status.style.top = "10px"
  status.style.transform = "translate(-50%, 0)"
  status.style.padding = "4px 10px"
  status.style.background = "rgba(10, 167, 255, 0.6)"
  status.style.color = "#fff"
  status.style.fontSize = "16px"
  status.style.fontFamily =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  status.style.borderRadius = "4px"
  status.style.pointerEvents = "none"
  status.style.zIndex = "2147483647"
  status.style.whiteSpace = "nowrap"
  return status
}
