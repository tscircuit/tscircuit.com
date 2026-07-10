import { useCallback, useEffect, useRef, useState } from "react"

export type ResizeDirection = "horizontal" | "vertical"

interface UseResizableOptions {
  /** Initial size of the *first* panel as a percentage (0–100). */
  initialSizePct: number
  /** Minimum size of the first panel in percent. */
  minSizePct?: number
  /** Maximum size of the first panel in percent. */
  maxSizePct?: number
  direction?: ResizeDirection
  /** localStorage key to persist the value across reloads. */
  storageKey?: string
}

/**
 * Returns [sizePct, dragHandleProps] where `sizePct` is the percentage
 * width (or height) of the *first* panel and `dragHandleProps` should be
 * spread on the drag-handle element.
 */
export function useResizable({
  initialSizePct,
  minSizePct = 10,
  maxSizePct = 90,
  direction = "horizontal",
  storageKey,
}: UseResizableOptions) {
  const getInitial = () => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) {
        const v = Number(stored)
        if (!Number.isNaN(v))
          return Math.min(maxSizePct, Math.max(minSizePct, v))
      }
    }
    return initialSizePct
  }

  const [sizePct, setSizePct] = useState(getInitial)
  const containerRef = useRef<HTMLElement | null>(null)
  const isDragging = useRef(false)

  const clamp = useCallback(
    (v: number) => Math.min(maxSizePct, Math.max(minSizePct, v)),
    [minSizePct, maxSizePct],
  )

  const onDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      isDragging.current = true

      const handleMove = (ev: MouseEvent | TouchEvent) => {
        if (!isDragging.current) return
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const clientPos =
          "touches" in ev
            ? direction === "horizontal"
              ? ev.touches[0].clientX
              : ev.touches[0].clientY
            : direction === "horizontal"
              ? (ev as MouseEvent).clientX
              : (ev as MouseEvent).clientY

        const offset =
          direction === "horizontal"
            ? clientPos - rect.left
            : clientPos - rect.top
        const total = direction === "horizontal" ? rect.width : rect.height
        const pct = clamp((offset / total) * 100)
        setSizePct(pct)
        if (storageKey) localStorage.setItem(storageKey, String(pct))
      }

      const handleUp = () => {
        isDragging.current = false
        window.removeEventListener("mousemove", handleMove)
        window.removeEventListener("mouseup", handleUp)
        window.removeEventListener("touchmove", handleMove)
        window.removeEventListener("touchend", handleUp)
      }

      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleUp)
      window.addEventListener("touchmove", handleMove, { passive: false })
      window.addEventListener("touchend", handleUp)
    },
    [clamp, direction, storageKey],
  )

  return {
    sizePct,
    containerRef,
    dragHandleProps: { onMouseDown: onDragStart, onTouchStart: onDragStart },
  }
}
