import type { StreamedLogEntry } from "@/hooks/use-sse-log-stream"
import { saveAs } from "file-saver"

type BuildLogEntry = Pick<StreamedLogEntry, "msg" | "timestamp">

const formatLogMessage = ({ msg, timestamp }: BuildLogEntry) =>
  [timestamp, msg].filter(Boolean).join(" ")

export const formatBuildLogs = (logs: BuildLogEntry[]) =>
  logs.map(formatLogMessage).join("\n")

export const downloadBuildLogs = (logs: BuildLogEntry[], buildId: string) => {
  const content = `${formatBuildLogs(logs)}\n`
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })

  saveAs(blob, `tscircuit-build-${buildId}-logs.txt`)
}
