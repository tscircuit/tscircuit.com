import { useEffect, useRef } from "react"

import { Sentry } from "@/lib/sentry"
import { cn } from "@/lib/utils"

const SKELETON_ERROR_THRESHOLD_MS = 3_000

let skeletonVisibilityErrorSent = false

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const startTimeRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    if (skeletonVisibilityErrorSent) {
      return () => {
        startTimeRef.current = null
      }
    }

    startTimeRef.current = performance.now()

    const localClassName = className

    timeoutRef.current = window.setTimeout(() => {
      skeletonVisibilityErrorSent = true

      const duration =
        startTimeRef.current !== null
          ? Math.round(performance.now() - startTimeRef.current)
          : SKELETON_ERROR_THRESHOLD_MS

      const pathname = window.location?.pathname ?? "unknown"
      const href = window.location?.href ?? "unknown"

      Sentry.captureException(
        new Error("Skeleton visible longer than expected"),
        {
          level: "error",
          tags: { component: "Skeleton" },
          extra: {
            pathname,
            href,
            displayDurationMs: duration,
            className: localClassName,
            thresholdMs: SKELETON_ERROR_THRESHOLD_MS,
          },
        },
      )
    }, SKELETON_ERROR_THRESHOLD_MS)

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      startTimeRef.current = null
    }
  }, [className])

  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-900/10 dark:bg-slate-50/10",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
