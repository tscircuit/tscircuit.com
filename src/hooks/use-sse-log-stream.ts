import { useState, useEffect, useRef } from "react"

export type StreamedLogEntry = {
  message: string
  eventType: "log" | "stdout" | "stderr"
}

/**
 * Custom hook to manage Server-Sent Events (SSE) log streaming
 *
 * This hook connects to an SSE endpoint and streams log messages in real-time.
 * It handles connection lifecycle, deduplication, and cleanup automatically.
 *
 * @param streamUrl - The URL of the SSE endpoint to connect to
 * @param isActive - Whether the stream should be active (typically when job is in progress)
 * @param releaseId - Unique identifier for the current release (triggers cleanup on change)
 * @returns An object containing the streamed logs array
 *
 */
export function useSSELogStream(
  streamUrl: string | null | undefined,
  isActive: boolean,
  releaseId: string,
) {
  const [streamedLogs, setStreamedLogs] = useState<StreamedLogEntry[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)
  const seenLogIds = useRef<Set<string>>(new Set())
  const hasReceivedDataRef = useRef(false)
  const isClosedRef = useRef(false)

  useEffect(() => {
    isClosedRef.current = false
    hasReceivedDataRef.current = false

    if (!streamUrl || !isActive) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      return
    }

    // Don't create a new connection if one already exists
    if (eventSourceRef.current) {
      return
    }

    setStreamedLogs([])
    seenLogIds.current.clear()

    try {
      // EventSource is a browser API for handling SSE connections
      const eventSource = new EventSource(streamUrl)
      eventSourceRef.current = eventSource

      // This function processes each incoming log message
      const handleLogMessage = (
        eventData: string,
        eventType: StreamedLogEntry["eventType"],
      ) => {
        if (isClosedRef.current) return

        hasReceivedDataRef.current = true
        const logId = `${eventType}:${eventData}`
        if (seenLogIds.current.has(logId)) {
          return // Silently skip duplicates
        }

        // Mark this log as seen
        seenLogIds.current.add(logId)

        try {
          // Try to parse as JSON first
          const data = JSON.parse(eventData)
          const logMessage = data.msg || data.message || JSON.stringify(data)
          setStreamedLogs((prev) => [
            ...prev,
            { message: logMessage, eventType },
          ])
        } catch (error) {
          // If parsing fails, treat the event data as a plain string
          setStreamedLogs((prev) => [...prev, { message: eventData, eventType }])
        }
      }

      // Connection opened successfully
      eventSource.onopen = () => {
        console.log("SSE connection opened successfully")
      }

      // Standard message event (most SSE servers use this)
      eventSource.onmessage = (event) => {
        handleLogMessage(event.data, "log")
      }

      // Custom "log" event type (if the server sends named events)
      eventSource.addEventListener("log", (event: any) => {
        handleLogMessage(event.data, "log")
      })

      eventSource.addEventListener("stdout", (event: any) => {
        handleLogMessage(event.data, "stdout")
      })

      eventSource.addEventListener("stderr", (event: any) => {
        handleLogMessage(event.data, "stderr")
      })

      // Error event (if the connection fails)
      eventSource.onerror = () => {
        if (isClosedRef.current) return
        isClosedRef.current = true
        eventSource.close()
        eventSourceRef.current = null
      }
    } catch (error) {
      console.error("Error setting up SSE connection", error)
      isClosedRef.current = true
    }

    return () => {
      // Cleanup: mark the connection as closed and close it
      isClosedRef.current = true
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [streamUrl, releaseId, isActive])

  return { streamedLogs }
}
