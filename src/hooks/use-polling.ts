import { useEffect, useRef, useState, useCallback } from "react"

interface UsePollingOptions<T> {
  /** Polling interval in milliseconds (default: 3000) */
  interval?: number
  /** Maximum polling duration in milliseconds (default: 120000 = 2 minutes) */
  timeout?: number
  /** Condition to stop polling - receives the latest data and returns true to stop */
  stopCondition: (data: T | undefined) => boolean
}

interface UsePollingResult {
  /** Whether polling is currently active */
  isPolling: boolean
  /** Start polling */
  startPolling: () => void
  /** Stop polling manually */
  stopPolling: () => void
}

export function usePolling<T>(
  refetchFn: () => Promise<{ data: T | undefined }>,
  options: UsePollingOptions<T>,
): UsePollingResult {
  const { interval = 3000, timeout = 120000, stopCondition } = options

  const [isPolling, setIsPolling] = useState(false)
  const stopConditionRef = useRef(stopCondition)

  // Keep the stop condition ref updated
  stopConditionRef.current = stopCondition

  const startPolling = useCallback(() => {
    setIsPolling(true)
  }, [])

  const stopPolling = useCallback(() => {
    setIsPolling(false)
  }, [])

  useEffect(() => {
    if (!isPolling) return

    const pollInterval = setInterval(async () => {
      const result = await refetchFn()
      if (stopConditionRef.current(result.data)) {
        setIsPolling(false)
      }
    }, interval)

    // Stop polling after timeout to avoid infinite polling
    const timeoutId = setTimeout(() => {
      setIsPolling(false)
    }, timeout)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeoutId)
    }
  }, [isPolling, refetchFn, interval, timeout])

  return { isPolling, startPolling, stopPolling }
}
