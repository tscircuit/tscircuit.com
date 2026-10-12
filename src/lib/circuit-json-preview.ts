export const MAX_CIRCUIT_JSON_PREVIEW_CHARACTERS = 256 * 1024

export const parseCircuitJsonPreview = (contentText?: string | null) => {
  if (!contentText) return { status: "unavailable" as const }
  // Check the original text before materializing geometry or invoking converters.
  if (contentText.length > MAX_CIRCUIT_JSON_PREVIEW_CHARACTERS) {
    return { status: "too-large" as const }
  }
  try {
    const parsed: unknown = JSON.parse(contentText)
    return Array.isArray(parsed)
      ? { status: "ready" as const, circuitJson: parsed as unknown[] }
      : { status: "unavailable" as const }
  } catch {
    return { status: "unavailable" as const }
  }
}
