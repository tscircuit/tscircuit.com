import { PackageParameterPanel } from "@/components/PackageParameterPanel"
import { PackagePreviewChangesProvider } from "@/components/PackagePreviewChanges"
import { PackagePreviewProvider } from "@/components/PackagePreviewScope"
import { PackageCircuitPreview } from "@/components/ViewPackagePage/components/package-circuit-preview"
import PreviewFileSelector from "@/components/ViewPackagePage/components/preview-file-selector"
import { useCurrentPackageCircuitJson } from "@/components/ViewPackagePage/hooks/use-current-package-circuit-json"
import { Button } from "@/components/ui/button"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackagePreviewParameters } from "@/hooks/use-package-preview-parameters"
import { getPackageRootUrl } from "@/lib/package-file-routes"
import type { ReferenceDesignSelection } from "@/lib/reference-design-selection"
import { useSchematicViewerController } from "@tscircuit/schematic-viewer"
import { ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"

const views = [
  { id: "3d", label: "3D" },
  { id: "pcb", label: "PCB" },
  { id: "schematic", label: "Schematic" },
]

function ReferenceDesignCircuit({
  name,
  releaseId,
  selection,
  onSelectionChange,
}: {
  name: string
  releaseId: string
  selection: ReferenceDesignSelection
  onSelectionChange: (selection: ReferenceDesignSelection) => void
}) {
  const parameters = usePackagePreviewParameters()
  const view = views.some((item) => item.id === selection.view)
    ? selection.view!
    : "schematic"
  const {
    packageRelease,
    error: releaseError,
    refetch: refetchRelease,
  } = useCurrentPackageRelease()
  const {
    data: packageFiles,
    isFetched,
    isFetching,
    error: filesError,
    refetch: refetchFiles,
  } = usePackageFiles(releaseId, { refetchOnMount: false })
  const {
    circuitJson,
    isLoading,
    error: circuitError,
    previewFilePath,
    previewFiles,
    refetch,
  } = useCurrentPackageCircuitJson()
  const { controller, focusSchematicComponent } = useSchematicViewerController()
  const { data: pkg } = usePackageByName(name)
  const [author, packageName] = name.split("/")
  const packageParams = new URLSearchParams({ package_release_id: releaseId })
  if (previewFilePath) packageParams.set("preview_file", previewFilePath)
  if (selection.sheet) packageParams.set("schematic_sheet", selection.sheet)
  const href = `${getPackageRootUrl(author, packageName)}?${packageParams}#${view}`
  const error = releaseError || filesError || circuitError
  const mismatchedRelease =
    packageRelease && pkg && packageRelease.package_id !== pkg.package_id

  const changeView = (nextView: string) =>
    onSelectionChange({
      ...selection,
      view: nextView,
      release: releaseId,
    })
  const showSchematicComponent = ({
    source_component_id,
  }: { source_component_id: string }) => {
    const component = circuitJson?.find(
      (element) =>
        element.type === "schematic_component" &&
        element.source_component_id === source_component_id,
    )
    if (!component || component.type !== "schematic_component") return
    focusSchematicComponent(component.schematic_component_id)
    changeView("schematic")
  }

  return (
    <PackagePreviewChangesProvider
      circuitJson={circuitJson}
      selectionKey={`${releaseId}:${previewFilePath}`}
    >
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {!parameters.manifest && previewFiles.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Configuration</span>
                <PreviewFileSelector label="Configuration" />
              </div>
            )}
            <div
              className="flex gap-1 rounded-md bg-gray-100 p-1"
              role="group"
              aria-label="Reference design view"
            >
              {views.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={view === item.id ? "outline" : "ghost"}
                  aria-pressed={view === item.id}
                  onClick={() => changeView(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title="Open package in a new tab"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            Open package
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
        <div
          className={
            parameters.manifest?.parameters.length
              ? "grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]"
              : ""
          }
        >
          {Boolean(parameters.manifest?.parameters.length) &&
            parameters.manifest && (
              <PackageParameterPanel manifest={parameters.manifest} />
            )}
          <div className="min-w-0">
            {mismatchedRelease ? (
              <p role="alert" className="p-8 text-red-600">
                This release does not belong to the selected design.
              </p>
            ) : error ? (
              <div
                className="flex min-h-64 flex-col items-center justify-center gap-3"
                role="alert"
              >
                <p>Unable to load the reference design.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    refetchRelease()
                    refetchFiles()
                    refetch()
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : isLoading || !isFetched ? (
              <div
                className="flex h-[620px] items-center justify-center text-sm text-gray-500"
                role="status"
              >
                Loading reference design...
              </div>
            ) : (
              <PackageCircuitPreview
                view={view}
                packageReleaseId={releaseId}
                packageFiles={packageFiles}
                arePackageFilesFetched={isFetched}
                isFetchingPackageFiles={isFetching}
                schematicController={controller}
                onViewSchematicComponent={
                  circuitJson?.some(
                    (element) => element.type === "schematic_component",
                  )
                    ? showSchematicComponent
                    : undefined
                }
              />
            )}
          </div>
        </div>
      </div>
    </PackagePreviewChangesProvider>
  )
}

export function ReferenceDesignPreview({
  name,
  selection,
  onSelectionChange,
}: {
  name: string
  selection: ReferenceDesignSelection
  onSelectionChange: (selection: ReferenceDesignSelection) => void
}) {
  const { data: pkg, isLoading, error, refetch } = usePackageByName(name)
  const [resolvedRelease, setResolvedRelease] = useState<string>()
  useEffect(() => {
    if (!resolvedRelease && pkg)
      setResolvedRelease(
        pkg.last_built_release_id ?? pkg.latest_package_release_id ?? undefined,
      )
  }, [pkg, resolvedRelease])
  const releaseId =
    selection.release ||
    resolvedRelease ||
    pkg?.last_built_release_id ||
    pkg?.latest_package_release_id

  if (error || (!isLoading && pkg && !releaseId))
    return (
      <div
        className="flex min-h-64 flex-col items-center justify-center gap-3"
        role="alert"
      >
        <p>Unable to load the reference design.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  if (!releaseId)
    return (
      <div
        className="flex h-[620px] items-center justify-center text-sm text-gray-500"
        role="status"
      >
        Loading reference design...
      </div>
    )

  return (
    <PackagePreviewProvider
      value={{
        packageName: name,
        releaseId,
        previewFilePath: selection.file,
        schematicSheet: selection.sheet,
        selectSchematicSheet: (sheet) =>
          onSelectionChange({
            ...selection,
            sheet,
            release: releaseId,
          }),
        selectFile: (path) =>
          onSelectionChange({
            ...selection,
            file: path,
            release: releaseId,
          }),
      }}
    >
      <ReferenceDesignCircuit
        name={name}
        releaseId={releaseId}
        selection={selection}
        onSelectionChange={onSelectionChange}
      />
    </PackagePreviewProvider>
  )
}
