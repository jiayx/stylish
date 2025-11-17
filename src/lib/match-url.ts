export function matchUrl(pattern: string, url: string) {
  if (!pattern) return false

  if (pattern === "<all_urls>" || pattern === "*://*/*") return true

  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`^${escaped.replace(/\\\*/g, ".*")}$`)
  return regex.test(url)
}
