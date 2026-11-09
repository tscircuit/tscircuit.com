import type { ComponentProps } from "react"
import type { SchematicViewerController } from "@tscircuit/schematic-viewer"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"
import ThreeDView from "./tab-views/3d-view"
import PCBView from "./tab-views/pcb-view"
import SchematicView from "./tab-views/schematic-view"
import { KeepMountedView } from "./keep-mounted-view"

export function PackageCircuitPreview({
  view,
  packageReleaseId,
  packageFiles,
  arePackageFilesFetched,
  isFetchingPackageFiles,
  schematicController,
  onViewSchematicComponent,
}: {
  view: string
  packageReleaseId?: string
  packageFiles?: { file_path: string; package_file_id: string }[]
  arePackageFilesFetched: boolean
  isFetchingPackageFiles?: boolean
  schematicController?: SchematicViewerController
  onViewSchematicComponent?: ComponentProps<
    typeof ThreeDView
  >["onViewSchematicComponent"]
}) {
  const { previewFilePath } = useCurrentPackageCircuitJson()
  const key = `${packageReleaseId}:${previewFilePath ?? "default"}`
  return (
    <>
      <KeepMountedView key={`3d:${key}`} active={view === "3d"}>
        <ThreeDView
          packageFiles={packageFiles}
          arePackageFilesFetched={arePackageFilesFetched}
          isFetchingPackageFiles={isFetchingPackageFiles}
          onViewSchematicComponent={onViewSchematicComponent}
        />
      </KeepMountedView>
      <KeepMountedView key={`pcb:${key}`} active={view === "pcb"}>
        <PCBView onViewSchematicComponent={onViewSchematicComponent} />
      </KeepMountedView>
      {view === "schematic" && (
        <SchematicView controller={schematicController} />
      )}
    </>
  )
}
