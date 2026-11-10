import { PackageParameterPanel } from "@/components/PackageParameterPanel"
import { usePackagePreviewScope } from "@/components/PackagePreviewScope"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useGlobalStore } from "@/hooks/use-global-store"
import {
  usePackagePreviewParameters,
  usePreparedPackageParameters,
} from "@/hooks/use-package-preview-parameters"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import {
  downloadPackagePreviewGlb,
  findPackagePreviewGlb,
} from "@/lib/package-preview-glb"
import { normalizePreviewPath } from "@/lib/preview-circuit-files"
import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useQueryClient } from "react-query"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"

const configurationLabel = (path?: string) =>
  path
    ?.replace(/^dist\//, "")
    .replace(/\/circuit\.json(?:\.gz)?$/, "")
    .replace(/^index(?:\/|$)/, "")
    .replace(/[_/-]+/g, " ") || "Default"

function PreviewBuildSelector({ label }: { label?: string } = {}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { previewFiles, previewFilePath, packageFiles, prefetchPreview } =
    useCurrentPackageCircuitJson()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const queryClient = useQueryClient()
  const apiBaseUrl = useApiBaseUrl()
  const token = useGlobalStore((state) => state.session?.token)
  const scope = usePackagePreviewScope()

  if (previewFiles.length < 2) return null

  const selectFile = async (path: string) => {
    const startingUrl = window.location.href
    setOpen(false)
    setSearch("")
    setPending(true)
    setError(undefined)
    try {
      // Commit the selection only after its assets are cached. A cold switch
      // keeps the current configuration and its label in place until ready.
      const view = window.location.hash.slice(1) || (scope ? "schematic" : "3d")
      const glb = view === "3d" && findPackagePreviewGlb(packageFiles, path)
      await Promise.all([
        prefetchPreview(path, true),
        glb &&
          queryClient.fetchQuery(
            ["packagePreviewGlb", apiBaseUrl, glb.package_file_id, token],
            ({ signal }) =>
              downloadPackagePreviewGlb({
                apiBaseUrl,
                packageFileId: glb.package_file_id,
                token,
                signal,
              }),
            { staleTime: Infinity, cacheTime: 5 * 60_000, retry: false },
          ),
      ])
      // Respect navigation that happened while a cold selection was preparing.
      if (window.location.href !== startingUrl) return
      if (scope) scope.selectFile(path)
      else {
        const url = new URL(window.location.href)
        url.searchParams.set("preview_file", path)
        window.history.pushState({}, "", url)
        window.dispatchEvent(new Event("popstate"))
      }
    } catch {
      setError("Unable to switch configuration. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          setSearch("")
        }}
      >
        <PopoverTrigger asChild>
          <Button
            size="sm"
            role="combobox"
            aria-label={label ?? "Preview file"}
            aria-expanded={open}
            aria-busy={pending}
            disabled={pending}
            className="bg-white shadow-none text-gray-900 hover:bg-gray-100 border border-gray-300 px-1 pl-2 select-none"
          >
            {label
              ? configurationLabel(previewFilePath)
              : `${previewFiles.length} Builds`}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-80 max-w-[calc(100vw-2rem)] p-0"
        >
          <Command>
            <CommandInput
              placeholder="Find a preview file…"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No matching preview files.</CommandEmpty>
              <CommandGroup>
                {previewFiles.map((file) => {
                  const path = normalizePreviewPath(file.file_path)
                  return (
                    <CommandItem
                      key={file.package_file_id}
                      value={path}
                      onSelect={() => selectFile(path)}
                      className="cursor-pointer gap-2 hover:bg-gray-100 data-[selected=true]:bg-gray-100 dark:hover:bg-gray-800 dark:data-[selected=true]:bg-gray-800"
                    >
                      <span className="break-all text-xs font-mono flex-1">
                        {label
                          ? configurationLabel(path)
                          : path.replace(/^dist\//, "")}
                      </span>
                      {previewFilePath === path && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  )
}

export default function PreviewFileSelector(props: { label?: string } = {}) {
  const { manifest, error, isLoading } = usePackagePreviewParameters()
  if (manifest)
    return manifest.parameters.length ? (
      <ParameterSelector manifest={manifest} />
    ) : null
  if (isLoading)
    return (
      <Button size="sm" variant="outline" disabled>
        Parameters
      </Button>
    )
  if (error)
    return (
      <p role="alert" className="text-sm text-red-600">
        Unable to load circuit parameters.
      </p>
    )
  return <PreviewBuildSelector {...props} />
}

function ParameterSelector({
  manifest,
}: {
  manifest: import("@/lib/package-preview-parameters").PreviewParameterManifest
}) {
  usePreparedPackageParameters(manifest)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          Parameters
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[75vh] w-80 overflow-y-auto p-0"
      >
        <PackageParameterPanel manifest={manifest} />
      </PopoverContent>
    </Popover>
  )
}
