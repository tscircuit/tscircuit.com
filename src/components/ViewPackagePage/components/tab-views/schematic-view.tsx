import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"
import { SchematicViewer } from "@tscircuit/schematic-viewer"

export default function SchematicView() {
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()
  if (isLoading) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center h-[620px]">
        <p className="text-gray-500 dark:text-[#8b949e]">
          Loading schematic view...
        </p>
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
      <SchematicViewer
        disableGroups
        clickToInteractEnabled
        circuitJson={circuitJson}
        containerStyle={{
          height: 620,
        }}
      />
    </div>
  )
}
