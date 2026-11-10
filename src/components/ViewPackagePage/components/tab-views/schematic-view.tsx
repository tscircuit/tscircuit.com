import { usePackagePreviewChanges } from "@/components/PackagePreviewChanges"
import { usePackagePreviewScope } from "@/components/PackagePreviewScope"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useGlobalStore } from "@/hooks/use-global-store"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useUrlParams } from "@/hooks/use-url-params"
import { downloadPackageCircuitJson } from "@/lib/download-package-circuit-json"
import {
  emptyCircuitChanges,
  getRemovedSchematicOutlines,
  getSchematicChangeCss,
} from "@/lib/package-circuit-changes"
import {
  SchematicViewer,
  type SchematicViewerController,
} from "@tscircuit/schematic-viewer"
import { type ComponentProps, useMemo, useRef } from "react"
import { useQuery } from "react-query"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"

export default function SchematicView({
  controller,
}: {
  controller?: SchematicViewerController
}) {
  const { circuitJson, componentPath, isLoading, error } =
    useCurrentPackageCircuitJson()
  const { packageRelease } = useCurrentPackageRelease({ refetchOnMount: false })
  const { data: files } = usePackageFiles(packageRelease?.package_release_id, {
    refetchOnMount: false,
  })
  const scope = usePackagePreviewScope()
  const params = useUrlParams()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((state) => state.session?.token)
  const directory =
    componentPath?.slice(0, componentPath.lastIndexOf("/") + 1) ?? ""
  const sheets = (files ?? [])
    .filter(
      (file) =>
        file.file_path.startsWith(directory) &&
        /^schematic(?:-[^/]+)?\.json(?:\.gz)?$/i.test(
          file.file_path.slice(directory.length),
        ),
    )
    .sort((a, b) => a.file_path.localeCompare(b.file_path))
  const requestedSheet = scope ? scope.schematicSheet : params.schematic_sheet
  const selectedSheet =
    sheets.find(
      (file) => file.file_path.slice(directory.length) === requestedSheet,
    ) ?? sheets[0]
  const sheet = useQuery(
    [
      "packageSchematicSheet",
      selectedSheet?.package_file_id,
      apiBaseUrl,
      token,
    ],
    ({ signal }) =>
      downloadPackageCircuitJson({
        apiBaseUrl,
        packageFileId: selectedSheet!.package_file_id,
        token,
        signal,
      }),
    {
      enabled: Boolean(selectedSheet),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      keepPreviousData: true,
    },
  )
  const selectSheet = (name: string) => {
    if (scope?.selectSchematicSheet) return scope.selectSchematicSheet(name)
    const url = new URL(window.location.href)
    url.searchParams.set("schematic_sheet", name)
    window.history.pushState({}, "", url)
    window.dispatchEvent(new Event("popstate"))
  }
  const displayedCircuit = selectedSheet ? sheet.data : circuitJson
  const changes = usePackagePreviewChanges()
  const changeCss = useMemo(
    () => getSchematicChangeCss(changes?.circuit ?? emptyCircuitChanges),
    [changes?.circuit],
  )
  const removedOutlines = useMemo(
    () => getRemovedSchematicOutlines(changes?.circuit ?? emptyCircuitChanges),
    [changes?.circuit],
  )
  const revision = useRef(0)
  const viewerCircuit = useMemo(
    () =>
      displayedCircuit
        ? Object.assign([...displayedCircuit, ...removedOutlines], {
            // The viewer caches SVGs by array length and editCount. Value-only
            // parameter changes need a revision even when no parts are added.
            editCount: ++revision.current,
          })
        : undefined,
    [displayedCircuit, changeCss, removedOutlines],
  )
  const loadError = error || sheet.error
  if (isLoading || (selectedSheet && sheet.isLoading)) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center h-[620px]">
        <p className="text-gray-500 dark:text-[#8b949e]">
          Loading schematic view...
        </p>
      </div>
    )
  }

  if (loadError || !displayedCircuit) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400">
          {loadError
            ? "Unable to load schematic"
            : "Circuit JSON not available"}
        </p>
      </div>
    )
  }

  return (
    <div>
      {sheets.length > 0 && (
        <label className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <span>Schematic sheet</span>
          <select
            aria-label="Schematic sheet"
            className="max-w-full rounded-md border bg-white p-2"
            value={selectedSheet.file_path.slice(directory.length)}
            onChange={(event) => selectSheet(event.target.value)}
          >
            {sheets.map((file) => (
              <option
                key={file.package_file_id}
                value={file.file_path.slice(directory.length)}
              >
                {file.file_path
                  .slice(directory.length)
                  .replace(/^schematic-?/, "")
                  .replace(/\.json(?:\.gz)?$/, "")
                  .replace(/[_-]/g, " ") || "Schematic"}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="h-[620px]">
        <SchematicViewer
          controller={controller}
          css={changeCss}
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
