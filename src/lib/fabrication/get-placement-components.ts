import type { AnyCircuitElement, PcbComponent } from "circuit-json"
import type { PickAndPlaceRow } from "circuit-json-to-pnp-csv"
import type { loadCircuitJsonToPnpCsv } from "@/lib/utils/load-internal-dynamic-modules"

export interface PlacementComponent {
  component: PcbComponent
  source: Extract<AnyCircuitElement, { type: "source_component" }>
  designator: string
  row: PickAndPlaceRow
}

export const getPlacementComponents = (
  circuitJson: AnyCircuitElement[],
  converter: Awaited<ReturnType<typeof loadCircuitJsonToPnpCsv>>,
): PlacementComponent[] => {
  const sources = new Map(
    circuitJson.flatMap((e) =>
      e.type === "source_component"
        ? [[e.source_component_id, e] as const]
        : [],
    ),
  )
  return circuitJson.flatMap((component) => {
    if (component.type !== "pcb_component") return []
    const source = sources.get(component.source_component_id)
    if (!source) return []
    // Let the converter own DNP, test-point and bare-hole exclusions. Retain
    // each component's identity even when different subcircuits reuse a name.
    const row = converter.convertCircuitJsonToPickAndPlaceRows(
      circuitJson.filter((e) => e.type !== "pcb_component" || e === component),
    )[0]
    return row ? [{ component, source, designator: row.designator, row }] : []
  })
}
