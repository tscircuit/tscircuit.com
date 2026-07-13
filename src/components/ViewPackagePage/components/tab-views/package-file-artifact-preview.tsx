import { useEffect, useMemo, useState } from "react"
import {
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import type { PackageFile } from "fake-snippets-api/lib/db/schema"
import { usePackageFile } from "@/hooks/use-package-files"
import { getPackageFileArtifactPaths } from "@/lib/package-file-artifacts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PreviewKind = "pcb" | "schematic"

interface PackageFileArtifactPreviewProps {
  packageReleaseId?: string
  selectedFilePath: string
  packageFiles?: Pick<PackageFile, "file_path">[]
}

const svgToDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

const parseCircuitJson = (contentText?: string | null) => {
  if (!contentText) return null
  try {
    const parsed = JSON.parse(contentText)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const convertCircuitJson = (
  circuitJson: unknown[] | null,
  converter: (circuitJson: any[]) => string,
) => {
  if (!circuitJson) return null
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
  const artifactPaths = useMemo(
    () => getPackageFileArtifactPaths(selectedFilePath, packageFiles),
    [packageFiles, selectedFilePath],
  )
  const queryOptions = {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  }
  const pcbSvgFile = usePackageFile(
    packageReleaseId && artifactPaths.pcbSvgPath
      ? {
          package_release_id: packageReleaseId,
          file_path: artifactPaths.pcbSvgPath,
        }
      : null,
    queryOptions,
  )
  const schematicSvgFile = usePackageFile(
    packageReleaseId && artifactPaths.schematicSvgPath
      ? {
          package_release_id: packageReleaseId,
          file_path: artifactPaths.schematicSvgPath,
        }
      : null,
    queryOptions,
  )
  const circuitJsonFile = usePackageFile(
    packageReleaseId && artifactPaths.circuitJsonPath
      ? {
          package_release_id: packageReleaseId,
          file_path: artifactPaths.circuitJsonPath,
        }
      : null,
    queryOptions,
  )

  const circuitJson = useMemo(
    () => parseCircuitJson(circuitJsonFile.data?.content_text),
    [circuitJsonFile.data?.content_text],
  )
  const pcbSvg = useMemo(
    () =>
      pcbSvgFile.data?.content_text ||
      convertCircuitJson(circuitJson, convertCircuitJsonToPcbSvg),
    [circuitJson, pcbSvgFile.data?.content_text],
  )
  const schematicSvg = useMemo(
    () =>
      schematicSvgFile.data?.content_text ||
      convertCircuitJson(circuitJson, convertCircuitJsonToSchematicSvg),
    [circuitJson, schematicSvgFile.data?.content_text],
  )
  const availableKinds = useMemo(
    () =>
      [pcbSvg ? "pcb" : null, schematicSvg ? "schematic" : null].filter(
        (kind): kind is PreviewKind => Boolean(kind),
      ),
    [pcbSvg, schematicSvg],
  )
  const [selectedKind, setSelectedKind] = useState<PreviewKind>("pcb")

  useEffect(() => {
    if (!availableKinds.includes(selectedKind) && availableKinds[0]) {
      setSelectedKind(availableKinds[0])
    }
  }, [availableKinds, selectedKind])

  const hasArtifactPath = Boolean(
    artifactPaths.pcbSvgPath ||
      artifactPaths.schematicSvgPath ||
      artifactPaths.circuitJsonPath,
  )
  const isLoading =
    pcbSvgFile.isLoading ||
    schematicSvgFile.isLoading ||
    circuitJsonFile.isLoading

  if (!packageReleaseId || !hasArtifactPath) return null

  if (isLoading && availableKinds.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center border-b border-gray-200 bg-gray-50 text-sm text-gray-500 dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]">
        Loading circuit preview...
      </div>
    )
  }

  if (availableKinds.length === 0) return null

  const selectedSvg = selectedKind === "pcb" ? pcbSvg : schematicSvg

  return (
    <section
      className="border-b border-gray-200 bg-gray-50 p-3 sm:p-4 dark:border-[#30363d] dark:bg-[#161b22]"
      aria-label="Circuit preview"
      data-testid="file-artifact-preview"
    >
      {availableKinds.length > 1 && (
        <Tabs
          value={selectedKind}
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
      {selectedSvg && (
        <img
          key={selectedKind}
          src={svgToDataUrl(selectedSvg)}
          alt={`${selectedKind === "pcb" ? "PCB" : "Schematic"} preview for ${selectedFilePath}`}
          className="max-h-[36rem] min-h-64 w-full rounded-md border border-gray-200 bg-white object-contain dark:border-[#30363d]"
        />
      )}
    </section>
  )
}
