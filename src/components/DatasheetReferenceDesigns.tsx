import { useEffect, useState } from "react"
import { Link } from "wouter"
import { useSchematicViewerController } from "@tscircuit/schematic-viewer"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useUrlParams } from "@/hooks/use-url-params"
import { getDatasheetReferenceDesignPackages } from "@/lib/datasheet-reference-design-packages"
import { getPackageRootUrl } from "@/lib/package-file-routes"
import { PackagePreviewProvider } from "@/components/PackagePreviewScope"
import { useCurrentPackageCircuitJson } from "@/components/ViewPackagePage/hooks/use-current-package-circuit-json"
import { PackageCircuitPreview } from "@/components/ViewPackagePage/components/package-circuit-preview"
import PreviewFileSelector from "@/components/ViewPackagePage/components/preview-file-selector"
import { Button } from "@/components/ui/button"

function updateReferenceParams(values: Record<string, string | undefined>) {
  const url = new URL(window.location.href)
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
  window.history.pushState({}, "", url)
  window.dispatchEvent(new Event("popstate"))
}

const views = [
  { id: "3d", label: "3D" },
  { id: "pcb", label: "PCB" },
  { id: "schematic", label: "Schematic" },
]

function ReferenceDesignPreview({
  name,
  releaseId,
}: { name: string; releaseId: string }) {
  const params = useUrlParams()
  const view = views.some((item) => item.id === params.reference_view)
    ? params.reference_view
    : "3d"
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
    refetch,
  } = useCurrentPackageCircuitJson()
  const { controller, focusSchematicComponent } = useSchematicViewerController()
  const { data: pkg } = usePackageByName(name)
  const [author, packageName] = name.split("/")
  const packageParams = new URLSearchParams({ package_release_id: releaseId })
  if (previewFilePath) packageParams.set("preview_file", previewFilePath)
  const href = `${getPackageRootUrl(author, packageName)}?${packageParams}#${view}`
  const error = releaseError || filesError || circuitError
  const mismatchedRelease =
    packageRelease && pkg && packageRelease.package_id !== pkg.package_id

  const changeView = (nextView: string) =>
    updateReferenceParams({
      reference_view: nextView,
      reference_design: name,
      reference_release: releaseId,
    })
  const showSchematicComponent = ({
    source_component_id,
  }: { source_component_id: string }) => {
    const component = circuitJson?.find(
      (element) =>
        element.type === "schematic_component" &&
        element.source_component_id === source_component_id,
    )
    if (!component) return
    focusSchematicComponent(component.schematic_component_id)
    changeView("schematic")
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="min-w-0 break-words font-semibold">{packageName}</h3>
        <Link
          href={href}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Open package
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Configuration</span>
          <PreviewFileSelector label="Configuration" />
        </div>
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
  )
}

function ReferenceDesignPackage({ name }: { name: string }) {
  const { data: pkg, isLoading, error, refetch } = usePackageByName(name)
  const params = useUrlParams()
  const [resolvedRelease, setResolvedRelease] = useState<string>()
  useEffect(() => {
    if (!resolvedRelease && pkg)
      setResolvedRelease(
        pkg.last_built_release_id ?? pkg.latest_package_release_id ?? undefined,
      )
  }, [pkg, resolvedRelease])
  const releaseId =
    params.reference_release ||
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
        previewFilePath: params.reference_file,
        schematicSheet: params.reference_sheet,
        selectSchematicSheet: (sheet) =>
          updateReferenceParams({
            reference_sheet: sheet,
            reference_design: name,
            reference_release: releaseId,
          }),
        selectFile: (path) =>
          updateReferenceParams({
            reference_file: path,
            reference_design: name,
            reference_release: releaseId,
          }),
      }}
    >
      <ReferenceDesignPreview name={name} releaseId={releaseId} />
    </PackagePreviewProvider>
  )
}

export function DatasheetReferenceDesigns({ chipName }: { chipName: string }) {
  const packages = getDatasheetReferenceDesignPackages(chipName)
  const params = useUrlParams()
  if (packages.length === 0) return null
  const name = packages.includes(params.reference_design)
    ? params.reference_design
    : packages[0]

  return (
    <section
      id="reference-designs"
      aria-labelledby="reference-designs-heading"
      className="mb-6 rounded-lg border bg-white p-4 shadow-sm md:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="reference-designs-heading" className="text-xl font-semibold">
          Reference designs
        </h2>
        {packages.length > 1 && (
          <select
            aria-label="Reference design"
            value={name}
            onChange={(event) =>
              updateReferenceParams({
                reference_design: event.target.value,
                reference_file: undefined,
                reference_release: undefined,
              })
            }
            className="max-w-full rounded-md border p-2 text-sm"
          >
            {packages.map((packageName) => (
              <option key={packageName} value={packageName}>
                {packageName}
              </option>
            ))}
          </select>
        )}
      </div>
      <ReferenceDesignPackage key={`${chipName}:${name}`} name={name} />
    </section>
  )
}
