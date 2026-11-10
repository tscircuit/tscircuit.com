import { PackageParameterPanel } from "@/components/PackageParameterPanel"
import { PackagePreviewChangesProvider } from "@/components/PackagePreviewChanges"
import { PackageCircuitPreview } from "@/components/ViewPackagePage/components/package-circuit-preview"
import { Button } from "@/components/ui/button"
import type { usePackageConfiguration } from "@/hooks/use-package-configuration"
import { getPackagePreviewUrl } from "@/lib/package-file-routes"
import type { PackagePreviewSelection } from "@/lib/package-preview-selection"
import { useSchematicViewerController } from "@tscircuit/schematic-viewer"
import { ExternalLink } from "lucide-react"

const views = [
  { id: "3d", label: "3D" },
  { id: "pcb", label: "PCB" },
  { id: "schematic", label: "Schematic" },
]

export function PackageConfigurationPreview({
  configuration,
  onSelectionChange,
  hidePackageLink = false,
}: {
  configuration: ReturnType<typeof usePackageConfiguration>
  onSelectionChange: (selection: PackagePreviewSelection) => void
  hidePackageLink?: boolean
}) {
  const {
    name,
    releaseId,
    selection,
    view,
    manifest,
    variant,
    circuitJson,
    metadataReady,
    ready,
    error,
  } = configuration
  const { controller, focusSchematicComponent } = useSchematicViewerController()
  const [author, packageName] = name.split("/")
  const resolvedSelection = {
    ...selection,
    release: releaseId,
    file: variant?.circuitJsonPath ?? selection.file,
  }
  const changeView = (view: string) =>
    onSelectionChange({ ...resolvedSelection, view })
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
  const hasControls = Boolean(manifest?.parameters.length)
  return (
    <PackagePreviewChangesProvider
      circuitJson={circuitJson ?? null}
      selectionKey={`${releaseId}:${variant?.circuitJsonPath}`}
    >
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex gap-1 rounded-md bg-gray-100 p-1"
            role="group"
            aria-label="Circuit view"
          >
            {views.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={view === item.id ? "outline" : "ghost"}
                disabled={!metadataReady}
                aria-pressed={view === item.id}
                onClick={() => changeView(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          {!hidePackageLink && (
            <a
              href={getPackagePreviewUrl({
                author,
                packageName,
                selection: resolvedSelection,
              })}
              target="_blank"
              rel="noopener noreferrer"
              title="Open package in a new tab"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              Open package{" "}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
        <div
          className={
            hasControls || (!metadataReady && !error)
              ? "grid min-h-[620px] items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]"
              : "min-h-[620px]"
          }
        >
          {hasControls && manifest && variant ? (
            <PackageParameterPanel
              manifest={manifest}
              values={variant.values}
              disabled={!ready || Boolean(error)}
              onChange={(values) => {
                const file = configuration.selectParameters(values)
                if (file) onSelectionChange({ ...resolvedSelection, file })
              }}
            />
          ) : !metadataReady && !error ? (
            <div
              className="h-[620px] rounded-lg bg-gray-50"
              aria-hidden="true"
            />
          ) : null}
          <div className="min-w-0">
            {error ? (
              <div
                className="flex h-[620px] flex-col items-center justify-center gap-3"
                role="alert"
              >
                <p>Unable to load the circuit preview.</p>
                <Button variant="outline" onClick={configuration.retry}>
                  Retry
                </Button>
              </div>
            ) : !ready ? (
              <div
                className="h-[620px] rounded-md bg-gray-50"
                aria-busy="true"
              />
            ) : hidePackageLink && !hasControls ? (
              <p className="py-8 text-sm text-gray-500">
                This release has no published configuration fields.
              </p>
            ) : (
              <PackageCircuitPreview
                key={releaseId}
                view={view}
                packageFiles={configuration.files}
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
