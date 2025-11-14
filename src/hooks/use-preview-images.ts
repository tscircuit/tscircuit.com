import { useEffect, useState, useMemo } from "react"
import { usePackageFileByRelease } from "./use-package-files"
import { useAxios } from "./use-axios"

interface UsePreviewImagesProps {
  packageReleaseId?: string | null
}

export function usePreviewImages({ packageReleaseId }: UsePreviewImagesProps) {
  const axios = useAxios()

  const { data: cadFile } = usePackageFileByRelease(
    packageReleaseId ?? null,
    "dist/3d.png",
  )
  const { data: pcbFile } = usePackageFileByRelease(
    packageReleaseId ?? null,
    "dist/pcb.svg",
  )
  const { data: schematicFile } = usePackageFileByRelease(
    packageReleaseId ?? null,
    "dist/schematic.svg",
  )

  const [imageStatus, setImageStatus] = useState<
    Record<string, "loading" | "loaded" | "error">
  >({})

  const imageUrls = useMemo(() => {
    const baseUrl = axios.defaults.baseURL || ""

    return {
      cadPreviewUrl: cadFile?.package_file_id
        ? `${baseUrl}/package_files/download?package_file_id=${cadFile.package_file_id}`
        : null,
      pcbPreviewUrl: pcbFile?.package_file_id
        ? `${baseUrl}/package_files/download?package_file_id=${pcbFile.package_file_id}`
        : null,
      schematicPreviewUrl: schematicFile?.package_file_id
        ? `${baseUrl}/package_files/download?package_file_id=${schematicFile.package_file_id}`
        : null,
    }
  }, [cadFile, pcbFile, schematicFile, axios.defaults.baseURL])

  useEffect(() => {
    setImageStatus({
      "3d": imageUrls.cadPreviewUrl ? "loading" : "error",
      pcb: imageUrls.pcbPreviewUrl ? "loading" : "error",
      schematic: imageUrls.schematicPreviewUrl ? "loading" : "error",
    })
  }, [
    imageUrls.cadPreviewUrl,
    imageUrls.pcbPreviewUrl,
    imageUrls.schematicPreviewUrl,
  ])

  const views = [
    {
      id: "3d",
      label: "3D View",
      backgroundClass: "bg-gray-100",
      imageUrl: imageUrls.cadPreviewUrl ?? undefined,
    },
    {
      id: "pcb",
      label: "PCB View",
      backgroundClass: "bg-black",
      imageUrl: imageUrls.pcbPreviewUrl ?? undefined,
    },
    {
      id: "schematic",
      label: "Schematic View",
      backgroundClass: "bg-[#F5F1ED]",
      imageUrl: imageUrls.schematicPreviewUrl ?? undefined,
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
