import { useMemo, useState } from "react"
import {
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import type { PackageFile } from "fake-snippets-api/lib/db/schema"
import { usePackageFile } from "@/hooks/use-package-files"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { getPackageFileArtifactPaths } from "@/lib/package-file-artifacts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { parseCircuitJsonPreview } from "@/lib/circuit-json-preview"

type PreviewKind = "pcb" | "schematic"

interface PackageFileArtifactPreviewProps {
  packageReleaseId?: string
  selectedFilePath: string
  packageFiles?: Pick<PackageFile, "file_path" | "package_file_id">[]
}

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

const convertCircuitJson = (
  circuitJson: unknown[],
  converter: (circuitJson: any[]) => string,
) => {
  try {
    return converter(circuitJson)
  } catch {
    return null
  }
}

export default function PackageFileArtifactPreview({
  packageReleaseId,
  selectedFilePath,
  packageFiles,
}: PackageFileArtifactPreviewProps) {
  const apiBaseUrl = useApiBaseUrl().replace(/\/$/, "")
  const artifactPaths = useMemo(
    () => getPackageFileArtifactPaths(selectedFilePath, packageFiles),
    [packageFiles, selectedFilePath],
  )
  const getArtifactDownloadUrl = (filePath?: string) => {
    if (!filePath) return null
    const packageFile = packageFiles?.find(
      (file) => file.file_path.replace(/^\/+/, "") === filePath,
    )
    if (!packageFile?.package_file_id) return null
    if (import.meta.env.PROD) {
      return `/package-file-images/${encodeURIComponent(
        packageFile.package_file_id,
      )}.svg`
    }
    return `${apiBaseUrl}/package_files/download?package_file_id=${encodeURIComponent(
      packageFile.package_file_id,
    )}`
  }
  const pcbSvgUrl = getArtifactDownloadUrl(artifactPaths.pcbSvgPath)
  const schematicSvgUrl = getArtifactDownloadUrl(artifactPaths.schematicSvgPath)
  const availableKinds = useMemo(
    () =>
      [
        pcbSvgUrl || artifactPaths.circuitJsonPath ? "pcb" : null,
        schematicSvgUrl || artifactPaths.circuitJsonPath ? "schematic" : null,
      ].filter((kind): kind is PreviewKind => Boolean(kind)),
    [pcbSvgUrl, schematicSvgUrl, artifactPaths.circuitJsonPath],
  )
  const [selectedKind, setSelectedKind] = useState<PreviewKind>("pcb")
  const [requestedKinds, setRequestedKinds] = useState(
    () => new Set<PreviewKind>(),
  )
  const activeKind = availableKinds.includes(selectedKind)
    ? selectedKind
    : (availableKinds[0] ?? "pcb")
  const prebuiltSvgUrl = activeKind === "pcb" ? pcbSvgUrl : schematicSvgUrl
  const needsGeneratedPreview =
    !prebuiltSvgUrl && requestedKinds.has(activeKind)
  const queryOptions = {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  }
  const circuitJsonFile = usePackageFile(
    packageReleaseId && artifactPaths.circuitJsonPath && needsGeneratedPreview
      ? {
          package_release_id: packageReleaseId,
          file_path: artifactPaths.circuitJsonPath,
        }
      : null,
    queryOptions,
  )

  const parsedPreview = useMemo(
    () =>
      needsGeneratedPreview
        ? parseCircuitJsonPreview(circuitJsonFile.data?.content_text)
        : { status: "unavailable" as const },
    [needsGeneratedPreview, circuitJsonFile.data?.content_text],
  )
  const generatedSvg = useMemo(() => {
    if (parsedPreview.status !== "ready") return null
    const svg = convertCircuitJson(
      parsedPreview.circuitJson,
      activeKind === "pcb"
        ? convertCircuitJsonToPcbSvg
        : convertCircuitJsonToSchematicSvg,
    )
    return svg ? svgToDataUrl(svg) : null
  }, [parsedPreview, activeKind])

  if (!packageReleaseId || availableKinds.length === 0) return null

  const selectedPreviewSrc = prebuiltSvgUrl || generatedSvg
  const previewLabel = activeKind === "pcb" ? "PCB" : "Schematic"

  return (
    <section
      className="border-b border-gray-200 bg-gray-50 p-3 sm:p-4 dark:border-[#30363d] dark:bg-[#161b22]"
      aria-label="Circuit preview"
      data-testid="file-artifact-preview"
    >
      {availableKinds.length > 1 && (
        <Tabs
          value={activeKind}
          onValueChange={(value) => setSelectedKind(value as PreviewKind)}
          className="mb-3"
        >
          <TabsList aria-label="Circuit preview type">
            {availableKinds.map((kind) => (
              <TabsTrigger key={kind} value={kind} className="capitalize">
                {kind === "pcb" ? "PCB" : "Schematic"}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      {selectedPreviewSrc ? (
        <img
          key={activeKind}
          src={selectedPreviewSrc}
          loading="lazy"
          decoding="async"
          alt={`${previewLabel} preview for ${selectedFilePath}`}
          className="max-h-[36rem] min-h-64 w-full rounded-md border border-gray-200 bg-white object-contain dark:border-[#30363d]"
        />
      ) : (
        <div className="flex min-h-32 items-center justify-center text-sm text-gray-500 dark:text-[#8b949e]">
          {!needsGeneratedPreview ? (
            <Button
              variant="outline"
              onClick={() =>
                setRequestedKinds((previous) =>
                  new Set(previous).add(activeKind),
                )
              }
            >
              Load {previewLabel} preview
            </Button>
          ) : circuitJsonFile.isLoading ? (
            <p>Loading circuit preview...</p>
          ) : parsedPreview.status === "too-large" ? (
            <p>
              This circuit file is too large for an inline preview. Download the
              file to view it.
            </p>
          ) : (
            <p>A circuit preview is not available for this file.</p>
          )}
        </div>
      )}
    </section>
  )
}
