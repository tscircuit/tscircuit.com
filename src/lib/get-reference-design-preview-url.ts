export function getReferenceDesignPreviewUrl(chipName: string) {
  if (import.meta.env.VITE_REFERENCE_DESIGN_PREVIEW_ENABLED !== "true")
    return undefined
  if (
    chipName !== "NE555DR" ||
    new URLSearchParams(window.location.search).get(
      "reference_design_preview",
    ) !== "ne555"
  )
    return undefined
  return "/reference-design-preview"
}
