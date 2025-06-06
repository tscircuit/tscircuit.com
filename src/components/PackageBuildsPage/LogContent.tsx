type ErrorObject =
  | {
      message: string
    }
  | string

const getErrorText = (error: ErrorObject | string) => {
  if (typeof error === "string") {
    return error
  }
  return error.message
}

export const LogContent = ({
  logs,
  error,
}: {
  logs: Array<{
    type: "info" | "success" | "error"
    message: string
    timestamp: string
  }>
  error?: ErrorObject | string | null
}) => {
  return (
    <div className="whitespace-pre-wrap font-mono text-xs">
      {logs.map(
        (log, i) =>
          log.timestamp &&
          log.message && (
            <div
              key={i}
              className={
                log.type === "error"
                  ? "text-red-600"
                  : log.type === "success"
                    ? "text-green-600"
                    : "text-gray-600"
              }
            >
              {new Date(log.timestamp).toLocaleTimeString()} {log.message}
            </div>
          ),
      )}
      {error && <div className="text-red-600">{getErrorText(error)}</div>}
    </div>
  )
}
