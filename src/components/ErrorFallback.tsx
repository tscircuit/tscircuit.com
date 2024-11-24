import React from "react"

export const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div
      data-testid="error-container"
      className="error-container mt-4 bg-red-50 rounded-md border border-red-200"
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold text-red-800 mb-3">
          Error Loading 3D Viewer
        </h2>
        <p className="text-xs font-mono whitespace-pre-wrap text-red-700">
          {error.message}
        </p>
        <details
          style={{ whiteSpace: "pre-wrap" }}
          className="text-xs font-mono text-red-600 mt-2"
        >
          {error.stack}
        </details>
      </div>
    </div>
  )
}
