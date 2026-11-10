import { usePackagePreviewChanges } from "@/components/PackagePreviewChanges"
import { useSchematicChangeHighlights } from "@/hooks/use-schematic-change-highlights"
import { emptyCircuitChanges } from "@/lib/package-circuit-changes"
import {
  SchematicViewer,
  type SchematicViewerController,
} from "@tscircuit/schematic-viewer"
import { type ComponentProps, useMemo, useRef } from "react"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"

export default function SchematicView({
  controller,
}: {
  controller?: SchematicViewerController
}) {
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()
  const changes = usePackagePreviewChanges()
  const revision = useRef(0)
  const viewerCircuit = useMemo(
    () =>
      circuitJson
        ? Object.assign([...circuitJson], {
            // The viewer caches SVGs by array length and editCount. Value-only
            // parameter changes need a revision even when no parts are added.
            editCount: ++revision.current,
          })
        : undefined,
    [circuitJson],
  )
  const containerRef = useRef<HTMLDivElement>(null)
  useSchematicChangeHighlights({
    containerRef,
    changes: changes ?? emptyCircuitChanges,
    renderedCircuit: isLoading ? undefined : viewerCircuit,
  })
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
          {error ? "Unable to load schematic" : "Circuit JSON not available"}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div ref={containerRef} className="h-[620px]">
        <SchematicViewer
          controller={controller}
          disableGroups
          clickToInteractEnabled
          circuitJson={
            // The viewer bundles an older Circuit JSON type definition.
            viewerCircuit as ComponentProps<
              typeof SchematicViewer
            >["circuitJson"]
          }
          containerStyle={{
            height: 620,
          }}
        />
      </div>
    </div>
  )
}
