import {
  SystemBlockViewer,
  type SystemBlockViewerProps,
} from "@tscircuit/system-block-viewer"
import { ErrorBoundary } from "react-error-boundary"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"
import "./system-view.css"

export default function SystemView({
  onComponentClick,
}: Pick<SystemBlockViewerProps, "onComponentClick">) {
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
    <div className="h-[620px] overflow-hidden rounded-md border border-gray-200 bg-white dark:border-[#30363d] dark:bg-[#0d1117]">
      <ErrorBoundary
        resetKeys={[circuitJson]}
        fallback={<div role="alert">Error loading System diagram</div>}
      >
        <SystemBlockViewer
          circuitJson={circuitJson}
          onComponentClick={onComponentClick}
          className="package-system-viewer"
          containerStyle={{ background: "transparent" }}
        />
      </ErrorBoundary>
    </div>
  )
}
