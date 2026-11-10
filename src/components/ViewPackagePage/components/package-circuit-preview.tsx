import type { SchematicViewerController } from "@tscircuit/schematic-viewer"
import type { ComponentProps } from "react"
import { KeepMountedView } from "./keep-mounted-view"
import ThreeDView from "./tab-views/3d-view"
import PCBView from "./tab-views/pcb-view"
import SchematicView from "./tab-views/schematic-view"

export function PackageCircuitPreview({
  view,
  packageFiles,
  schematicController,
  onViewSchematicComponent,
}: {
  view: string
  packageFiles?: { file_path: string; package_file_id: string }[]
  schematicController?: SchematicViewerController
  onViewSchematicComponent?: ComponentProps<
    typeof ThreeDView
  >["onViewSchematicComponent"]
}) {
  return (
    <>
      <KeepMountedView active={view === "3d"}>
        <ThreeDView
          packageFiles={packageFiles}
          arePackageFilesFetched
          onViewSchematicComponent={onViewSchematicComponent}
        />
      </KeepMountedView>
      <KeepMountedView active={view === "pcb"}>
        <PCBView
          renderer="canvas"
          className="h-[620px]"
          onViewSchematicComponent={onViewSchematicComponent}
        />
      </KeepMountedView>
      <KeepMountedView active={view === "schematic"}>
        <SchematicView controller={schematicController} />
      </KeepMountedView>
    </>
  )
}
