import { useMemo } from "react"

interface UsePackageReleaseDbImagesProps {
  packageRelease?: {
    pcb_preview_image_url?: string | null
    sch_preview_image_url?: string | null
    cad_preview_image_url?: string | null
  } | null
}

interface ViewConfig {
  id: string
  label: string
  backgroundClass: string
  urlField: keyof NonNullable<UsePackageReleaseDbImagesProps["packageRelease"]>
}

const VIEWS: ViewConfig[] = [
  {
    id: "3d",
    label: "3D",
    backgroundClass: "bg-gray-100",
    urlField: "cad_preview_image_url",
  },
  {
    id: "pcb",
    label: "PCB",
    backgroundClass: "bg-black",
    urlField: "pcb_preview_image_url",
  },
  {
    id: "schematic",
    label: "Schematic",
    backgroundClass: "bg-[#F5F1ED]",
    urlField: "sch_preview_image_url",
  },
]

export function usePackageReleaseDbImages({
  packageRelease,
}: UsePackageReleaseDbImagesProps) {
  const availableViews = useMemo(() => {
    if (!packageRelease) return []

    return VIEWS.filter((view) => {
      const imageUrl = packageRelease[view.urlField]
      return imageUrl && imageUrl.trim() !== ""
    }).map((view) => ({
      id: view.id,
      label: view.label,
      imageUrl: packageRelease[view.urlField] as string,
      isLoading: false,
      backgroundClass: view.backgroundClass,
    }))
  }, [packageRelease])

  return { availableViews }
}
