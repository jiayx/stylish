import contentScriptFile from "@/content/main?script"
import type { Rule } from "@/types/types"

export type Message =
  | { type: "START_PICKER" }
  | { type: "STOP_PICKER" }
  | { type: "ELEMENT_PICKED"; selector: string }
  | { type: "RULE_SAVED"; ruleId: string }
  | { type: "PREVIEW_RULE"; rule: Rule }
  | { type: "REMOVE_RULE"; id: string }
  | { type: "RENDER_RULES" }

export type Response<T> = { ok: true; data?: T } | { ok: false; error: string }

export function sendToRuntime<T extends Message, R = any>(
  message: T,
): Promise<R> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        const err = chrome.runtime.lastError
        if (err) {
          reject(new Error(err.message))
        } else {
          resolve(response)
        }
      })
    } catch (e) {
      reject(e)
    }
  })
}

export async function sendToActiveTab<TReq extends Message, TRes = any>(
  message: TReq,
): Promise<TRes> {
  const tab = await getCurrentTab()
  if (!tab || !tab.id) {
    throw new Error("No active tab found")
  }
  return await sendToTab(tab.id, message)
}

export async function sendToTab<TReq extends Message, TRes = any>(
  tabId: number,
  message: TReq,
): Promise<TRes> {
  // 1. 尝试第一次发送
  try {
    const res = await _sendToTab<TReq, TRes>(tabId, message)
    return res
  } catch (err: unknown) {
    // 2. 检查是否为“未找到接收端”的特定错误
    let errMsg = ""
    if (err instanceof Error) {
      errMsg = err.message
    } else {
      errMsg = String(err)
    }

    const noReceiver =
      errMsg.includes(
        "Could not establish connection. Receiving end does not exist.",
      ) || errMsg.includes("Receiving end does not exist")

    // 3. 如果是其他错误，直接抛出
    if (!noReceiver) {
      console.error(
        `Error sending message to tab ${tabId} (not a 'no-receiver' error):`,
        err,
      )
      throw err
    }

    // 4. 确认是 "noReceiver" 错误，开始尝试注入
    console.log(
      `Content script not found in tab ${tabId}. Injecting '${contentScriptFile}'...`,
    )

    try {
      // 注入 content script
      // 注意: 这需要 "scripting" 权限和对目标 URL 的 host 权限
      await chrome.scripting.executeScript({
        target: { tabId },
        files: [contentScriptFile],
      })
    } catch (injectionError: unknown) {
      console.error(
        `Failed to inject script '${contentScriptFile}' into tab ${tabId}:`,
        injectionError,
      )
      // 注入失败，抛出一个信息更明确的新错误
      throw new Error(
        `Script injection failed: ${
          injectionError instanceof Error
            ? injectionError.message
            : String(injectionError)
        }`,
      )
    }

    // 5. 注入成功后，再次尝试发送消息
    console.log(`Script injected. Retrying message send to tab ${tabId}.`)

    // 等待 content script 初始化
    await sleep(200)

    // 如果这次还失败（例如 content script 内部错误），错误将自然抛出并由调用方处理
    return await _sendToTab<TReq, TRes>(tabId, message)
  }
}

function _sendToTab<TReq, TRes>(tabId: number, message: TReq): Promise<TRes> {
  return new Promise<TRes>((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: TRes) => {
      // 关键：必须检查 lastError
      const err = chrome.runtime.lastError
      if (err) {
        reject(new Error(err.message))
      } else {
        resolve(response)
      }
    })
  })
}

/**
 * [辅助函数] 封装 chrome.tabs.query 为 Promise
 * @param queryInfo 查询参数
 */
function queryTabs(
  queryInfo: chrome.tabs.QueryInfo,
): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      const err = chrome.runtime.lastError
      if (err) {
        reject(new Error(err.message))
      } else {
        resolve(tabs)
      }
    })
  })
}

/**
 * [辅助函数] 获取当前激活的 Tab
 * * @returns Promise<chrome.tabs.Tab | undefined>
 * 如果找到了，返回 Tab 对象；否则返回 undefined。
 */
export async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  // 调用我们封装好的 Promise 版本
  const tabs = await queryTabs({ active: true, currentWindow: true })

  // query 总是返回一个数组，我们取第一个
  return tabs[0]
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
