import { useState, useEffect, useRef } from "react"

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
  const [streamedLogs, setStreamedLogs] = useState<string[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)
  const seenLogIds = useRef<Set<string>>(new Set())

  useEffect(() => {
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
      const handleLogMessage = (eventData: string) => {
        const logId = eventData
        if (seenLogIds.current.has(logId)) {
          return // Silently skip duplicates
        }

        // Mark this log as seen
        seenLogIds.current.add(logId)

        try {
          // Try to parse as JSON first
          const data = JSON.parse(eventData)
          const logMessage = data.msg || data.message || JSON.stringify(data)
          setStreamedLogs((prev) => [...prev, logMessage])
        } catch (error) {
          // If parsing fails, treat the event data as a plain string
          setStreamedLogs((prev) => [...prev, eventData])
        }
      }

      // Connection opened successfully
      eventSource.onopen = () => {
        console.log("SSE connection opened successfully")
      }

      // Standard message event (most SSE servers use this)
      eventSource.onmessage = (event) => {
        handleLogMessage(event.data)
      }

      // Custom "log" event type (if the server sends named events)
      eventSource.addEventListener("log", (event: any) => {
        handleLogMessage(event.data)
      })

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error)
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSourceRef.current = null
        }
        // If readyState is CONNECTING (0), the browser will retry automatically
        // EventSource has built-in reconnection logic with exponential backoff
      }
    } catch (error) {
      console.error("Failed to create EventSource:", error)
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [streamUrl, releaseId, isActive])

  return { streamedLogs }
}
