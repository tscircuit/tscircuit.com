import { expect, test } from "bun:test"
import { getCircuitDiagnosticCounts } from "../src/lib/get-circuit-diagnostic-counts"

test("counts typed and legacy diagnostics without counting ordinary elements", () => {
  expect(
    getCircuitDiagnosticCounts([
      { type: "source_pin_missing_trace_warning" },
      { type: "pcb_manual_edit_conflict_warning" },
      { type: "pcb_trace_error" },
      { type: "source_error", error_type: "source_missing_component" },
      { type: "legacy", warning_type: "legacy_warning" },
      { type: "legacy", error_type: "legacy_error" },
      { type: "pcb_component", message: "error warning" },
      null,
      "warning",
      {},
    ]),
  ).toEqual({ warnings: 3, errors: 3 })
})

test("a successfully loaded clean circuit has zero diagnostics", () => {
  expect(getCircuitDiagnosticCounts([])).toEqual({ warnings: 0, errors: 0 })
})
