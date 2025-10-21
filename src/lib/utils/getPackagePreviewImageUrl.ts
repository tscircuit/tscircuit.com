import { Package } from "fake-snippets-api/lib/db/schema"

export const getPackagePreviewImageUrl = (
  pkg: Package,
  view: "pcb" | "schematic" | "3d" = "pcb",
) => {
  switch (view) {
    case "schematic":
      return pkg.latest_sch_preview_image_url
    case "3d":
      return pkg.latest_cad_preview_image_url
    default:
      return pkg.latest_pcb_preview_image_url
  }
}
