import { useCallback, useEffect, useState, type ComponentProps } from "react"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useQueryClient } from "react-query"
import {
  findPackagePreviewGlb,
  downloadPackagePreviewGlb,
} from "@/lib/package-preview-glb"
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
  const { circuitJson, previewFiles, prefetchPreview } =
    useCurrentPackageCircuitJson()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((state) => state.session?.token)
  const queryClient = useQueryClient()
  const key = packageReleaseId ?? "current"
  const [readyRelease, setReadyRelease] = useState<string | null>(null)
  const onThreeDReady = useCallback(() => setReadyRelease(key), [key])
  useEffect(() => {
    if (!circuitJson || !arePackageFilesFetched) return
    // Bound speculative downloads on packages with many builds. Only warm 3D
    // assemblies after the current 3D scene is ready so they do not compete
    // with the initial preview download.
    for (const file of previewFiles.slice(0, 8)) {
      void prefetchPreview(file.file_path)
      const glb =
        view === "3d" &&
        readyRelease === key &&
        findPackagePreviewGlb(packageFiles, file.file_path)
      if (glb)
        void queryClient.prefetchQuery(
          ["packagePreviewGlb", apiBaseUrl, glb.package_file_id, token],
          ({ signal }) =>
            downloadPackagePreviewGlb({
              apiBaseUrl,
              packageFileId: glb.package_file_id,
              token,
              signal,
            }),
          { staleTime: Infinity, cacheTime: 5 * 60_000 },
        )
    }
  }, [
    key,
    readyRelease,
    packageFiles,
    arePackageFilesFetched,
    Boolean(circuitJson),
    view,
    prefetchPreview,
    apiBaseUrl,
    token,
    queryClient,
  ])
  return (
    <>
      <KeepMountedView key={`3d:${key}`} active={view === "3d"}>
        <ThreeDView
          packageFiles={packageFiles}
          arePackageFilesFetched={arePackageFilesFetched}
          isFetchingPackageFiles={isFetchingPackageFiles}
          onViewSchematicComponent={onViewSchematicComponent}
          onReady={onThreeDReady}
        />
      </KeepMountedView>
      <KeepMountedView key={`pcb:${key}`} active={view === "pcb"}>
        <PCBView onViewSchematicComponent={onViewSchematicComponent} />
      </KeepMountedView>
      <KeepMountedView key={`schematic:${key}`} active={view === "schematic"}>
        <SchematicView controller={schematicController} />
      </KeepMountedView>
    </>
  )
}
