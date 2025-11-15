import type { Rule } from "../types/types"

export function useRules() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get({ rules: [] }, (data: { rules: Rule[] }) => {
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

export function saveRules(rules: Rule[]) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.set({ rules }, () => {
			const err = chrome.runtime.lastError
			if (err) {
				reject(err)
				return
			}
			resolve(true)
		})
	})
}
