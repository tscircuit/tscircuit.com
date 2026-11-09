export function getReferenceDesignPreviewUrl(chipName: string) {
  if (import.meta.env.VITE_REFERENCE_DESIGN_PREVIEW_ENABLED !== "true")
    return undefined
  if (chipName.trim().toUpperCase() !== "NE555DR") return undefined
  return "/reference-design-preview"
}
