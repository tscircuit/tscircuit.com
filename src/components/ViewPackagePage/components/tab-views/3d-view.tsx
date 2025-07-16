import { CadViewer } from "@tscircuit/runframe"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"
import { Suspense } from "react"

export default function ThreeDView() {
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()

  if (isLoading) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center h-[620px]">
        <p className="text-gray-500 dark:text-[#8b949e]">Loading 3D view...</p>
      </div>
    )
  }

  if (error || !circuitJson) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400">
          {error || "Circuit JSON not available"}
        </p>
      </div>
    )
  }

  return (
    <div className="h-[620px]">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <div className="w-48">
              <div className="loading">
                <div className="loading-bar"></div>
              </div>
            </div>
          </div>
        }
      >
        <CadViewer clickToInteractEnabled circuitJson={circuitJson} />
      </Suspense>
    </div>
  )
}
