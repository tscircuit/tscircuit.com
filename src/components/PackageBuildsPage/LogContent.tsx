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
}: { logs: any[]; error?: ErrorObject | string | null }) => {
  return (
    <div className="whitespace-pre-wrap font-mono text-xs">
      {logs.map((log) =>
        log.msg || log.message ? (
          <div>{log.msg ?? log.message}</div>
        ) : (
          <div>
            <pre>{log.message}</pre>
          </div>
        ),
      )}
      {error && <div className="text-red-600">{getErrorText(error)}</div>}
    </div>
  )
}
