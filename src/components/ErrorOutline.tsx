import { AlertCircle } from "lucide-react"

export function ErrorOutline({
  error,
  description,
}: { error?: Error; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-lg w-full mx-auto p-6 sm:p-8 bg-red-100/80 rounded-xl shadow-lg border border-red-500">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-10 w-10 text-red-700 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-3">
            Something strange happened
          </h2>
          <p className="text-red-600 font-medium mb-6 text-sm sm:text-base">
            {description ||
              "An unexpected error occurred while processing your request."}{" "}
            <br />
            Please try again or contact support if the problem persists.
          </p>
          {error?.message && (
            <details className="w-full text-left bg-red-50 p-3 rounded-md border border-red-200">
              <summary className="text-sm font-medium text-red-800 cursor-pointer hover:text-red-900">
                Show Error Details
              </summary>
              <pre className="mt-2 text-xs text-red-700 bg-transparent p-0 rounded overflow-auto whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
