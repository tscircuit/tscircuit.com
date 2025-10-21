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
      return pkg.latest_sch_preview_image_url
    case "3d":
      return pkg.latest_cad_preview_image_url
    case "pcb":
      return pkg.latest_pcb_preview_image_url
    default:
      return pkg.latest_cad_preview_image_url
  }
}
