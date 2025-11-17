import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// biome-ignore lint/suspicious/noExplicitAny: any
export function debounce(fn: (...args: any[]) => void, delay = 300) {
  let timer: number | null = null
  // biome-ignore lint/suspicious/noExplicitAny: any
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
