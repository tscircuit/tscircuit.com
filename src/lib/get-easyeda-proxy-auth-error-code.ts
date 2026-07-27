type CircuitJsonWarning = {
  type?: unknown
  message?: unknown
}

export const getEasyEdaProxyAuthErrorCode = (
  circuitJson: unknown,
): string | null => {
  if (!Array.isArray(circuitJson)) return null

  for (const element of circuitJson as CircuitJsonWarning[]) {
    const message = element?.message

    if (
      element?.type !== "source_part_not_found_warning" ||
      typeof message !== "string"
    ) {
      continue
    }

    const match = message.match(
      /EasyEDA proxy request failed: ([a-z_]+) \(HTTP 401\)/,
    )
    if (match) return match[1]
  }

  return null
}
