import { Package } from "fake-snippets-api/lib/db/schema"

/**
 * Default 3d preview
 */
export const getPackagePreviewImageUrl = (
  pkg: Package,
  view: "pcb" | "schematic" | "3d" = "3d",
) => {
  switch (view) {
    case "schematic":
      return String(pkg.latest_sch_preview_image_url)
    case "3d":
      return String(pkg.latest_cad_preview_image_url)
    case "pcb":
      return String(pkg.latest_pcb_preview_image_url)
    default:
      return String(pkg.latest_cad_preview_image_url)
  }
}
