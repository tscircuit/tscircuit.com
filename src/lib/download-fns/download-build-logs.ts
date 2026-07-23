import { saveAs } from "file-saver"

type BuildLogEntry = {
  msg?: unknown
  timestamp?: unknown
}

const formatLogMessage = (log: unknown) => {
  if (typeof log === "string") return log
  if (log === null || typeof log !== "object") return String(log)

  const { msg, timestamp } = log as BuildLogEntry
  const message =
    typeof msg === "string"
      ? msg
      : msg !== undefined
        ? JSON.stringify(msg)
        : JSON.stringify(log)
  const timestampText = typeof timestamp === "string" ? timestamp : ""

  return [timestampText, message].filter(Boolean).join(" ")
}

export const formatBuildLogs = (logs: unknown[]) =>
  logs.map(formatLogMessage).join("\n")

export const downloadBuildLogs = (logs: unknown[], buildId: string) => {
  const content = `${formatBuildLogs(logs)}\n`
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })

  saveAs(blob, `tscircuit-build-${buildId}-logs.txt`)
}
