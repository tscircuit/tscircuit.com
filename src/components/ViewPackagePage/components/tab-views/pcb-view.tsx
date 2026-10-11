import type { ComponentProps } from "react"
import { getPackagePcbRenderer } from "@/lib/get-package-pcb-renderer"
import { PcbViewerWithContainerHeight } from "@/components/PcbViewerWithContainerHeight"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"

export default function PCBView({
  onViewSchematicComponent,
}: {
  onViewSchematicComponent?: ComponentProps<
    typeof PcbViewerWithContainerHeight
  >["onViewSchematicComponent"]
}) {
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()

  if (isLoading) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <p className="text-gray-500 dark:text-[#8b949e]">Loading PCB view...</p>
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
    <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-4 mb-4 bg-white dark:bg-[#0d1117]">
      <PcbViewerWithContainerHeight
        renderer={getPackagePcbRenderer(circuitJson)}
        disablePcbGroups
        clickToInteractEnabled
        circuitJson={circuitJson}
        onViewSchematicComponent={onViewSchematicComponent}
        containerClassName="w-full h-[620px]"
      />
    </div>
  )
}
