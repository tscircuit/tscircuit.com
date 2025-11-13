import { useEffect, useMemo, useState } from "react"
import {
  normalizeSvgForSquareTile,
  svgToDataUrl,
} from "@/lib/normalize-svg-for-tile"
import {
  usePackageFileById,
  usePackageFiles,
} from "@/hooks/use-package-files"

interface UsePreviewImagesProps {
  cadPreviewUrl?: string | null
  pcbPreviewUrl?: string | null
  schematicPreviewUrl?: string | null
  packageReleaseId?: string | null
}

export function usePreviewImages({
  cadPreviewUrl,
  pcbPreviewUrl,
  schematicPreviewUrl,
  packageReleaseId,
}: UsePreviewImagesProps) {
  const needsFallbackImages = useMemo(
    () => !cadPreviewUrl || !pcbPreviewUrl || !schematicPreviewUrl,
    [cadPreviewUrl, pcbPreviewUrl, schematicPreviewUrl],
  )

  const { data: packageFiles } = usePackageFiles(
    needsFallbackImages ? packageReleaseId : null,
  )

  type ViewKey = "3d" | "pcb" | "schematic"

  const fallbackFileIds = useMemo(() => {
    if (!packageFiles?.length) return {} as Partial<Record<ViewKey, string>>

    const normalizePath = (path: string) => path.replace(/^\/+/, "")

    const fallbackPaths: Record<ViewKey, string> = {
      "3d": "dist/3d.svg",
      pcb: "dist/pcb.svg",
      schematic: "dist/schematic.svg",
    }

    return packageFiles.reduce((acc, file) => {
      const cleanedPath = normalizePath(file.file_path)

      for (const view of Object.keys(fallbackPaths) as ViewKey[]) {
        if (!acc[view] && cleanedPath === fallbackPaths[view]) {
          acc[view] = file.package_file_id
        }
      }

      return acc
    }, {} as Partial<Record<ViewKey, string>>)
  }, [packageFiles])

  const { data: fallbackCadFile } = usePackageFileById(
    !cadPreviewUrl ? fallbackFileIds["3d"] ?? null : null,
  )
  const { data: fallbackPcbFile } = usePackageFileById(
    !pcbPreviewUrl ? fallbackFileIds.pcb ?? null : null,
  )
  const { data: fallbackSchematicFile } = usePackageFileById(
    !schematicPreviewUrl ? fallbackFileIds.schematic ?? null : null,
  )

  const convertSvgToUrl = (svg?: string | null) => {
    if (!svg) return undefined
    const normalized = normalizeSvgForSquareTile(svg)
    return svgToDataUrl(normalized)
  }

  const fallbackCadImageUrl = useMemo(
    () => convertSvgToUrl(fallbackCadFile?.content_text),
    [fallbackCadFile?.content_text],
  )
  const fallbackPcbImageUrl = useMemo(
    () => convertSvgToUrl(fallbackPcbFile?.content_text),
    [fallbackPcbFile?.content_text],
  )
  const fallbackSchematicImageUrl = useMemo(
    () => convertSvgToUrl(fallbackSchematicFile?.content_text),
    [fallbackSchematicFile?.content_text],
  )

  const resolvedCadPreviewUrl = cadPreviewUrl ?? fallbackCadImageUrl ?? null
  const resolvedPcbPreviewUrl = pcbPreviewUrl ?? fallbackPcbImageUrl ?? null
  const resolvedSchematicPreviewUrl =
    schematicPreviewUrl ?? fallbackSchematicImageUrl ?? null

  const resolvedUrls = useMemo(
    () => ({
      "3d": resolvedCadPreviewUrl,
      pcb: resolvedPcbPreviewUrl,
      schematic: resolvedSchematicPreviewUrl,
    }),
    [resolvedCadPreviewUrl, resolvedPcbPreviewUrl, resolvedSchematicPreviewUrl],
  )

  const [imageStatus, setImageStatus] = useState<
    Record<string, "loading" | "loaded" | "error">
  >({
    "3d": resolvedCadPreviewUrl ? "loading" : "error",
    pcb: resolvedPcbPreviewUrl ? "loading" : "error",
    schematic: resolvedSchematicPreviewUrl ? "loading" : "error",
  })

  useEffect(() => {
    setImageStatus({
      "3d": resolvedCadPreviewUrl ? "loading" : "error",
      pcb: resolvedPcbPreviewUrl ? "loading" : "error",
      schematic: resolvedSchematicPreviewUrl ? "loading" : "error",
    })
  }, [
    resolvedCadPreviewUrl,
    resolvedPcbPreviewUrl,
    resolvedSchematicPreviewUrl,
  ])

  const views = [
    {
      id: "3d",
      label: "3D View",
      backgroundClass: "bg-gray-100",
      imageUrl: resolvedUrls["3d"] ?? undefined,
    },
    {
      id: "pcb",
      label: "PCB View",
      backgroundClass: "bg-black",
      imageUrl: resolvedUrls.pcb ?? undefined,
    },
    {
      id: "schematic",
      label: "Schematic View",
      backgroundClass: "bg-[#F5F1ED]",
      imageUrl: resolvedUrls.schematic ?? undefined,
    },
  ]

  const handleImageLoad = (viewId: string) => {
    setImageStatus((prev) => ({
      ...prev,
      [viewId]: "loaded",
    }))
  }

  const handleImageError = (viewId: string) => {
    setImageStatus((prev) => ({
      ...prev,
      [viewId]: "error",
    }))
  }

  const availableViews = views
    .filter((view) => Boolean(view.imageUrl))
    .map((view) => ({
      ...view,
      status: imageStatus[view.id],
      onLoad: () => handleImageLoad(view.id),
      onError: () => handleImageError(view.id),
    }))
    .filter((view) => view.status !== "error")

  return {
    availableViews,
  }
}
