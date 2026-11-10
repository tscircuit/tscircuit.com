import { usePackagePreviewParameters } from "@/hooks/use-package-preview-parameters"
import { PackageParameterPanel } from "@/components/PackageParameterPanel"
import { useEffect, useReducer, useState } from "react"
import { ExternalLink } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  readReferenceDesignSelection,
  referenceDesignReducer,
  referenceDesignUrlParams,
  type ReferenceDesignSelection,
} from "@/lib/reference-design-selection"

function updateReferenceParams(values: Record<string, string | undefined>) {
  const url = new URL(window.location.href)
  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
  if (url.href === window.location.href) return
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
    if (!component) return
    focusSchematicComponent(component.schematic_component_id)
    changeView("schematic")
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {!parameters.manifest && (
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
          parameters.manifest
            ? "grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]"
            : ""
        }
      >
        {parameters.manifest && (
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
  )
}

function ReferenceDesignPackage({
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
      <ReferenceDesignPreview
        name={name}
        releaseId={releaseId}
        selection={selection}
        onSelectionChange={onSelectionChange}
      />
    </PackagePreviewProvider>
  )
}

export function DatasheetReferenceDesigns({ chipName }: { chipName: string }) {
  const packages = getDatasheetReferenceDesignPackages(chipName)
  if (packages.length === 0) return null
  return <ReferenceDesignList key={chipName} packages={packages} />
}

function ReferenceDesignList({ packages }: { packages: readonly string[] }) {
  const params = useUrlParams()
  const urlName = packages.includes(params.reference_design)
    ? params.reference_design
    : packages[0]
  const [state, dispatch] = useReducer(referenceDesignReducer, {
    open: urlName,
    selections: { [urlName]: readReferenceDesignSelection(params) },
  })
  // Browser back/forward and shared links restore only the named design.
  useEffect(() => {
    dispatch({
      type: "navigate",
      name: urlName,
      selection: readReferenceDesignSelection(params),
    })
  }, [
    urlName,
    params.reference_release,
    params.reference_file,
    params.reference_sheet,
    params.reference_view,
  ])
  const selectDesign = (name: string) => {
    dispatch({ type: "open", name })
    if (name)
      updateReferenceParams(
        referenceDesignUrlParams(name, state.selections[name] ?? {}),
      )
  }
  const changeSelection = (
    name: string,
    selection: ReferenceDesignSelection,
  ) => {
    dispatch({ type: "selection", name, selection })
    updateReferenceParams(referenceDesignUrlParams(name, selection))
  }

  return (
    <Card
      id="reference-designs"
      role="region"
      aria-labelledby="reference-designs-heading"
      className="mb-6 min-w-0"
    >
      <CardHeader className="pb-2">
        <CardTitle
          id="reference-designs-heading"
          className="text-xl font-semibold"
        >
          Reference designs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          value={state.open}
          onValueChange={selectDesign}
          className="divide-y divide-slate-200"
        >
          {packages.map((name) => (
            <AccordionItem
              key={name}
              value={name}
              className="border-0 [&:not(:first-child)]:pt-4"
            >
              <AccordionTrigger
                aria-label={name}
                className="gap-3 pb-4 pt-0 text-left hover:no-underline"
              >
                <span className="min-w-0">
                  <span className="block break-words text-base font-semibold">
                    {name.split("/")[1]}
                  </span>
                  <span className="block text-xs font-normal text-gray-500">
                    {name.split("/")[0]}
                  </span>
                </span>
              </AccordionTrigger>
              {state.selections[name] && (
                <div hidden={state.open !== name}>
                  <AccordionContent forceMount className="pb-0">
                    <ReferenceDesignPackage
                      name={name}
                      selection={state.selections[name]}
                      onSelectionChange={(selection) =>
                        changeSelection(name, selection)
                      }
                    />
                  </AccordionContent>
                </div>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
