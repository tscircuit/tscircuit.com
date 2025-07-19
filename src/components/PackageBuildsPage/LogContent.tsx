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
    type?: "info" | "success" | "error"
    msg?: string
    message?: string
    timestamp?: string | number
    [key: string]: unknown
  }>
  error?: ErrorObject | string | null
}) => {
  return (
    <div className="font-mono text-xs space-y-1 min-w-0">
      {logs.map((log, i) => {
        const { type, msg, message, timestamp, ...rest } = log
        const text = msg ?? message
        if (!text) return null

        return (
          <div
            key={i}
            className={`break-words whitespace-pre-wrap ${
              type === "error"
                ? "text-red-600"
                : type === "success"
                  ? "text-green-600"
                  : "text-gray-600"
            }`}
          >
            {timestamp !== undefined && (
              <span className="text-gray-500 whitespace-nowrap">
                {new Date(Number(timestamp)).toLocaleTimeString()}
              </span>
            )}
            {timestamp !== undefined && " "}
            <span className="break-all">{text}</span>
            {Object.keys(rest).filter((k) => k !== "package_release_id")
              .length > 0 && (
              <span className="text-gray-500">
                {" "}
                {Object.entries(rest)
                  .filter(([key]) => key !== "package_release_id")
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(" ")}
              </span>
            )}
          </div>
        )
      })}
      {error && (
        <div className="text-red-600 break-words whitespace-pre-wrap">
          {getErrorText(error)}
        </div>
      )}
    </div>
  )
}
