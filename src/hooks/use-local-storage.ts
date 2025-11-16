import { useCallback, useEffect, useRef, useState } from "react"

type SetValue<T> = T | ((prev: T) => T)

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  const setValue = useCallback(
    (value: SetValue<T>) => {
      setStoredValue((prev) => {
        const valueToStore =
          value instanceof Function ? value(prev) : (value as T)
        chrome.storage.local.set({ [key]: valueToStore }, () => {
          const error = chrome.runtime.lastError
          if (error) {
            console.warn(`useLocalStorage: Error setting key “${key}”:`, error)
          }
        })
        return valueToStore
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    chrome.storage.local.remove(key, () => {
      const error = chrome.runtime.lastError
      if (error) {
        console.warn(`useLocalStorage: Error removing key “${key}”:`, error)
        return
      }
      setStoredValue(initialValue)
    })
  }, [initialValue, key])

  useEffect(() => {
    let isMounted = true

    chrome.storage.local.get([key], (result) => {
      if (!isMounted) return
      const error = chrome.runtime.lastError
      if (error) {
        console.warn(`useLocalStorage: Error reading key “${key}”:`, error)
        setStoredValue(initialValue)
        return
      }
      if (result[key] !== undefined) {
        setStoredValue(result[key] as T)
      } else {
        setStoredValue(initialValue)
      }
    })

    const handleStorage = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== "local" || !(key in changes)) {
        return
      }
      const change = changes[key]
      if (!change) return
      if (change.newValue === undefined) {
        setStoredValue(initialValue)
      } else {
        setStoredValue(change.newValue as T)
      }
    }

    chrome.storage.onChanged.addListener(handleStorage)
    return () => {
      isMounted = false
      chrome.storage.onChanged.removeListener(handleStorage)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

type Item = { id: string }

export function useListLocalStorage<T extends Item>(
  storageKey: string,
  initial: T[] = [],
) {
  const initialRef = useRef(initial)
  const [list, setList] = useState<T[]>(initialRef.current)

  useEffect(() => {
    let isMounted = true

    chrome.storage.local.get([storageKey], (result) => {
      if (!isMounted) return
      const error = chrome.runtime.lastError
      if (error) {
        console.warn("Failed to read storage key:", storageKey, error)
        setList(initialRef.current)
        return
      }
      const storedList = result[storageKey]
      if (Array.isArray(storedList)) {
        setList(storedList as T[])
      } else {
        setList(initialRef.current)
      }
    })

    const handleStorage = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName !== "local" || !(storageKey in changes)) {
        return
      }
      const change = changes[storageKey]
      if (!change) return
      if (Array.isArray(change.newValue)) {
        setList(change.newValue as T[])
      } else {
        setList(initialRef.current)
      }
    }

    chrome.storage.onChanged.addListener(handleStorage)
    return () => {
      isMounted = false
      chrome.storage.onChanged.removeListener(handleStorage)
    }
  }, [storageKey])

  const updateItem = useCallback(
    (id: string, partial: Partial<T>) => {
      setList((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, ...partial } : item,
        )
        chrome.storage.local.set({ [storageKey]: next }, () => {
          const err = chrome.runtime.lastError
          if (err) {
            console.warn("Failed to write storage key:", storageKey, err)
          }
        })
        return next
      })
    },
    [storageKey],
  )

  const appendItem = useCallback(
    (item: T) => {
      setList((prev) => {
        const next = [...prev, item]
        chrome.storage.local.set({ [storageKey]: next }, () => {
          const err = chrome.runtime.lastError
          if (err) {
            console.warn("Failed to write storage key:", storageKey, err)
          }
        })
        return next
      })
    },
    [storageKey],
  )

  const removeItem = useCallback(
    (id: string) => {
      setList((prev) => {
        const next = prev.filter((item) => item.id !== id)
        chrome.storage.local.set({ [storageKey]: next }, () => {
          const err = chrome.runtime.lastError
          if (err) {
            console.warn("Failed to write storage key:", storageKey, err)
          }
        })
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
