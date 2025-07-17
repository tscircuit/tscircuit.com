import { useEffect, useRef } from "react"

/**
 * Efficient hook for handling keyboard shortcuts
 *
 * Examples:
 * - useHotkeyCombo("cmd+b", () => toggleSidebar())
 * - useHotkeyCombo("ctrl+s", () => save())
 * - useHotkeyCombo("Escape", () => closeModal())
 * - useHotkey("Enter", () => submit(), { meta: true })
 */

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

export const useHotkey = (
  key: string,
  callback: HotkeyCallback,
  modifiers: HotkeyModifiers = {},
  options: HotkeyOptions = {},
) => {
  const callbackRef = useRef(callback)
  const {
    preventDefault = true,
    stopPropagation = false,
    target = document,
  } = options

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!target) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMatches = event.key.toLowerCase() === key.toLowerCase()

      // Check that all required modifiers are pressed
      const ctrlOk = modifiers.ctrl ? event.ctrlKey : true
      const altOk = modifiers.alt ? event.altKey : true
      const shiftOk = modifiers.shift ? event.shiftKey : true
      const metaOk = modifiers.meta ? event.metaKey || event.ctrlKey : true

      if (keyMatches && ctrlOk && altOk && shiftOk && metaOk) {
        if (preventDefault) {
          event.preventDefault()
        }
        if (stopPropagation) {
          event.stopPropagation()
        }
        callbackRef.current(event)
      }
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
  const modifiers: HotkeyModifiers = {}
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((part) => part.trim())

  const keyPart = parts[parts.length - 1]
  const modifierParts = parts.slice(0, -1)

  modifierParts.forEach((part) => {
    switch (part) {
      case "ctrl":
        modifiers.ctrl = true
        break
      case "cmd":
      case "meta":
        modifiers.meta = true
        break
      case "alt":
        modifiers.alt = true
        break
      case "shift":
        modifiers.shift = true
        break
    }
  })

  useHotkey(keyPart, callback, modifiers, options)
}
