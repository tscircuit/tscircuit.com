// Match RunFrame's Errors tab, including legacy error_type/warning_type entries.
export function getCircuitDiagnosticCounts(circuitJson: unknown[] | null) {
  let warnings = 0
  let errors = 0
  for (const element of circuitJson ?? []) {
    if (!element || typeof element !== "object") continue
    const type =
      "type" in element && typeof element.type === "string" ? element.type : ""
    if ("warning_type" in element || type.includes("warning")) warnings++
    if ("error_type" in element || type.includes("error")) errors++
  }
  return { warnings, errors }
}
