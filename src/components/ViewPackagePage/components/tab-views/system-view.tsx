import { SystemBlockViewer } from "@tscircuit/system-block-viewer"
import { ErrorBoundary } from "react-error-boundary"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"

export default function SystemView() {
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()
  if (isLoading)
    return (
      <div className="h-[620px] flex items-center justify-center" role="status">
        Loading system view...
      </div>
    )
  if (error || !circuitJson)
    return (
      <div className="p-8 text-red-500" role="alert">
        {error || "Circuit JSON not available"}
      </div>
    )
  return (
    <div className="h-[620px]">
      <ErrorBoundary
        resetKeys={[circuitJson]}
        fallback={<div role="alert">Error loading System diagram</div>}
      >
        <SystemBlockViewer
          circuitJson={circuitJson}
          containerStyle={{ height: 620 }}
        />
      </ErrorBoundary>
    </div>
  )
}
