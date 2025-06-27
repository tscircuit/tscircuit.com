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
    <div className="font-mono text-xs space-y-1 min-w-0">
      {logs.map(
        (log, i) =>
          log.timestamp &&
          log.message && (
            <div
              key={i}
              className={`break-words whitespace-pre-wrap ${
                log.type === "error"
                  ? "text-red-600"
                  : log.type === "success"
                    ? "text-green-600"
                    : "text-gray-600"
              }`}
            >
              <span className="text-gray-500 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>{" "}
              <span className="break-all">{log.message}</span>
            </div>
          ),
      )}
      {error && (
        <div className="text-red-600 break-words whitespace-pre-wrap">
          {getErrorText(error)}
        </div>
      )}
    </div>
  )
}
