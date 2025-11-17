// inspired by Chrome DevTools「Copy selector」
// usage: getCssSelector(element)
export function getCssSelector(node: Element, optimized = true) {
  const steps = []
  let contextNode: Element | null = node

  while (contextNode) {
    const step = cssPathStep(contextNode, !!optimized, contextNode === node)
    if (!step) break // 出错则提前结束
    steps.push(step)
    if (step.optimized) break // 已经足够唯一，不再往上找
    contextNode = contextNode.parentElement
  }

  return steps
    .reverse()
    .map((s) => s.value)
    .join(" > ")
}

function cssPathStep(node: Element, optimized: boolean, isTargetNode: boolean) {
  const id = node.id

  // 优化模式：有 id 就直接用 id 或 body/head/html
  if (optimized) {
    if (id) {
      return { value: `#${CSS.escape(id)}`, optimized: true }
    }
    const nodeNameLower = node.localName
    if (
      nodeNameLower === "body" ||
      nodeNameLower === "head" ||
      nodeNameLower === "html"
    ) {
      return { value: nodeNameLower, optimized: true }
    }
  }

  const nodeName = node.tagName.toLowerCase()

  // 有 id 且非“单独用 id”的情况：tag#id
  if (id) {
    return { value: `${nodeName}#${CSS.escape(id)}`, optimized: true }
  }

  const parent = node.parentElement
  if (!parent || parent.nodeType === Node.DOCUMENT_NODE) {
    // parent 是 document，直接用标签名
    return { value: nodeName, optimized: true }
  }

  function getClassList(el: Element) {
    const cls = (el.getAttribute("class") || "").trim()
    return cls ? cls.split(/\s+/g).filter(Boolean) : []
  }

  const ownClasses = getClassList(node)
  let needsClassNames = false
  let needsNthChild = false
  let ownIndex = -1
  let elementIndex = -1

  const siblings = parent.children
  for (
    let i = 0;
    siblings && (ownIndex === -1 || !needsNthChild) && i < siblings.length;
    ++i
  ) {
    const sibling = siblings[i]
    if (!(sibling instanceof Element)) continue

    elementIndex += 1

    if (sibling === node) {
      ownIndex = elementIndex
      continue
    }
    if (needsNthChild) continue
    if (sibling.tagName.toLowerCase() !== nodeName) continue

    // 有同名标签兄弟，需要进一步区分
    needsClassNames = true

    const ownClassSet = new Set(ownClasses)
    if (!ownClassSet.size) {
      // 自己没 class，只能用 nth-child
      needsNthChild = true
      continue
    }

    const siblingClasses = getClassList(sibling)
    for (const cls of siblingClasses) {
      if (!ownClassSet.has(cls)) continue
      ownClassSet.delete(cls)
      if (!ownClassSet.size) {
        // 自己的 class 集合被“吃光”了，说明仅靠 class 已不能区分，退回 nth-child
        needsNthChild = true
        break
      }
    }
  }

  let result = nodeName

  // input 特殊处理：没有 id/class 时用 type 辅助
  if (
    isTargetNode &&
    nodeName === "input" &&
    node.getAttribute("type") &&
    !node.id &&
    !node.getAttribute("class")
  ) {
    result += `[type=${CSS.escape(node.getAttribute("type") || "")}]`
  }

  if (needsNthChild) {
    result += `:nth-child(${ownIndex + 1})`
  } else if (needsClassNames) {
    for (const cls of ownClasses) {
      result += `.${CSS.escape(cls)}`
    }
  }

  return { value: result, optimized: false }
}
