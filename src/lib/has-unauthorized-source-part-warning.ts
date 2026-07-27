type CircuitJsonWarning = {
  type?: unknown
  message?: unknown
}

export const hasUnauthorizedSourcePartWarning = (
  circuitJson: unknown,
): boolean => {
  if (!Array.isArray(circuitJson)) return false

  return circuitJson.some((element: CircuitJsonWarning) => {
    const message = element?.message

    if (
      element?.type !== "source_part_not_found_warning" ||
      typeof message !== "string"
    ) {
      return false
    }

    return message.includes("(HTTP 401)")
  })
}
