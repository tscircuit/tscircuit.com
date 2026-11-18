import { DrawingViewer } from "@tscircuit/drawing-viewer"
import { ErrorBoundary } from "react-error-boundary"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"
import { usePackageCircuitModelAssets } from "../../hooks/use-package-circuit-model-assets"

export default function DrawingView() {
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()
  const { resolveStaticAsset, isLoading: isLoadingModels } =
    usePackageCircuitModelAssets(circuitJson)

  if (isLoading || isLoadingModels)
    return (
      <div className="h-[620px] flex items-center justify-center" role="status">
        Loading engineering drawing…
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
        resetKeys={[circuitJson, resolveStaticAsset]}
        fallback={<div role="alert">Error loading engineering drawing</div>}
      >
        <DrawingViewer
          circuitJson={circuitJson}
          resolveStaticAsset={resolveStaticAsset}
        />
      </ErrorBoundary>
    </div>
  )
}
