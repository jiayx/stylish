import "./content-style.css"

import { finder } from "@medv/finder"
import { sendToRuntime } from "@/lib/messaging"
import { bootstrapRules, renderRule, renderRules } from "./apply-style"

const pickerState: {
  active: boolean
  highlight: HTMLDivElement | null
  label: HTMLDivElement | null
  listenersBound: boolean
  lastTarget: EventTarget | null
} = {
  active: false,
  highlight: null,
  label: null,
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
  }
  sendResponse(true)
})

function startPicker() {
  if (pickerState.active) {
    stopPicker()
  }

  pickerState.active = true
  pickerState.highlight = document.createElement("div")
  pickerState.highlight.className = "__stylish-picker-highlight"
  pickerState.label = document.createElement("div")
  pickerState.label.className = "__stylish-picker-label"
  const mountTarget = document.body || document.documentElement
  mountTarget.append(pickerState.highlight, pickerState.label)

  if (!pickerState.listenersBound) {
    document.addEventListener("mousemove", handlePointerMove, true)
    document.addEventListener("mouseout", handlePointerOut, true)
    document.addEventListener("click", handlePickerClick, true)
    document.addEventListener("keydown", handlePickerKeydown, true)
  }
  pickerState.listenersBound = true
}

function stopPicker() {
  if (!pickerState.active) return
  pickerState.active = false

  if (pickerState.highlight) pickerState.highlight.remove()
  if (pickerState.label) pickerState.label.remove()
  pickerState.highlight = null
  pickerState.label = null
  pickerState.lastTarget = null

  if (pickerState.listenersBound) {
    document.removeEventListener("mousemove", handlePointerMove, true)
    document.removeEventListener("mouseout", handlePointerOut, true)
    document.removeEventListener("click", handlePickerClick, true)
    document.removeEventListener("keydown", handlePickerKeydown, true)
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
  const selector = finder(event.target as Element)
  sendToRuntime({
    type: "ELEMENT_PICKED",
    selector,
    url: window.location.href,
  }).catch(console.error)
  stopPicker()
}

function handlePickerKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault()
    stopPicker()
  }
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
