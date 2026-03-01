import { useEffect, useMemo, useRef } from "react"

type HotkeyModifiers = {
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
}

type HotkeyCallback = (event: KeyboardEvent) => void

type HotkeyOptions = {
  preventDefault?: boolean
  stopPropagation?: boolean
  target?: EventTarget | null
}

const MODIFIER_MAP: Record<string, keyof HotkeyModifiers> = {
  ctrl: "ctrl",
  cmd: "meta",
  meta: "meta",
  alt: "alt",
  shift: "shift",
}

function parseCombo(combo: string): {
  key: string
  modifiers: HotkeyModifiers
} {
  const parts = combo.toLowerCase().split("+")
  const key = parts[parts.length - 1].trim()
  const modifiers: HotkeyModifiers = {}

  for (let i = 0; i < parts.length - 1; i++) {
    const mod = MODIFIER_MAP[parts[i].trim()]
    if (mod) modifiers[mod] = true
  }

  return { key, modifiers }
}

export const useHotkey = (
  key: string,
  callback: HotkeyCallback,
  modifiers: HotkeyModifiers = {},
  options: HotkeyOptions = {},
) => {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const {
    preventDefault = true,
    stopPropagation = false,
    target = document,
  } = options

  useEffect(() => {
    if (!target) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return

      if (modifiers.ctrl && !event.ctrlKey) return
      if (modifiers.alt && !event.altKey) return
      if (modifiers.shift && !event.shiftKey) return
      if (modifiers.meta && !event.metaKey && !event.ctrlKey) return

      if (preventDefault) event.preventDefault()
      if (stopPropagation) event.stopPropagation()
      callbackRef.current(event)
    }

    target.addEventListener("keydown", handleKeyDown as EventListener)
    return () =>
      target.removeEventListener("keydown", handleKeyDown as EventListener)
  }, [
    key,
    modifiers.ctrl,
    modifiers.alt,
    modifiers.shift,
    modifiers.meta,
    preventDefault,
    stopPropagation,
    target,
  ])
}

export const useHotkeyCombo = (
  combo: string,
  callback: HotkeyCallback,
  options: HotkeyOptions = {},
) => {
  const { key, modifiers } = useMemo(() => parseCombo(combo), [combo])
  useHotkey(key, callback, modifiers, options)
}
