import { useCallback, useEffect, useState } from "react"

type SetValue<T> = T | ((prev: T) => T)

export function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key)
			if (item !== null) {
				return JSON.parse(item) as T
			}
			return initialValue
		} catch (error) {
			console.warn(`useLocalStorage: Error reading key “${key}”:`, error)
			return initialValue
		}
	})

	const setValue = useCallback(
		(value: SetValue<T>) => {
			try {
				const valueToStore =
					value instanceof Function ? value(storedValue) : value
				setStoredValue(valueToStore)
				window.localStorage.setItem(key, JSON.stringify(valueToStore))
			} catch (error) {
				console.warn(`useLocalStorage: Error setting key “${key}”:`, error)
			}
		},
		[key, storedValue],
	)

	const removeValue = useCallback(() => {
		try {
			window.localStorage.removeItem(key)
			setStoredValue(initialValue)
		} catch (error) {
			console.warn(`useLocalStorage: Error removing key “${key}”:`, error)
		}
	}, [key, initialValue])

	useEffect(() => {
		const handleStorage = (event: StorageEvent) => {
			if (event.key === key) {
				try {
					const newValue = event.newValue
						? (JSON.parse(event.newValue) as T)
						: initialValue
					setStoredValue(newValue)
				} catch {
					setStoredValue(initialValue)
				}
			}
		}

		window.addEventListener("storage", handleStorage)
		return () => {
			window.removeEventListener("storage", handleStorage)
		}
	}, [key, initialValue])

	return [storedValue, setValue, removeValue] as const
}

type Item = { id: string }

export function useListLocalStorage<T extends Item>(
	storageKey: string,
	initial: T[] = [],
) {
	const [list, setList] = useState<T[]>(() => {
		try {
			const raw = window.localStorage.getItem(storageKey)
			return raw ? (JSON.parse(raw) as T[]) : initial
		} catch (err) {
			console.warn("Failed to parse localStorage key:", storageKey, err)
			return initial
		}
	})

	const updateItem = useCallback(
		(id: string, partial: Partial<T>) => {
			setList((prev) => {
				const next = prev.map((item) =>
					item.id === id ? { ...item, ...partial } : item,
				)
				try {
					window.localStorage.setItem(storageKey, JSON.stringify(next))
				} catch (err) {
					console.warn("Failed to write localStorage key:", storageKey, err)
				}
				return next
			})
		},
		[storageKey],
	)

	const appendItem = useCallback(
		(item: T) => {
			setList((prev) => {
				const next = [...prev, item]
				try {
					window.localStorage.setItem(storageKey, JSON.stringify(next))
				} catch (err) {
					console.warn("Failed to write localStorage key:", storageKey, err)
				}
				return next
			})
		},
		[storageKey],
	)

	const removeItem = useCallback(
		(id: string) => {
			setList((prev) => {
				const next = prev.filter((item) => item.id !== id)
				try {
					window.localStorage.setItem(storageKey, JSON.stringify(next))
				} catch (err) {
					console.warn("Failed to write localStorage key:", storageKey, err)
				}
				return next
			})
		},
		[storageKey],
	)

	return {
		list,
		updateItem,
		appendItem,
		removeItem,
	}
}
