import type { AnyCircuitElement } from "circuit-json"
import type { loadCircuitJsonToPnpCsv } from "@/lib/utils/load-internal-dynamic-modules"
import Papa from "papaparse"
import { getPlacementComponents } from "./get-placement-components"
import {
  resolveSupplierRotations,
  type SupplierRotationOptions,
} from "./resolve-supplier-rotations"

export const createSupplierPnpCsv = async (
  circuitJson: AnyCircuitElement[],
  converter: Awaited<ReturnType<typeof loadCircuitJsonToPnpCsv>>,
  options: SupplierRotationOptions,
): Promise<string> => {
  const entries = getPlacementComponents(circuitJson, converter)
  const rotations = await resolveSupplierRotations(
    circuitJson,
    entries,
    options,
  )
  return Papa.unparse(
    entries.map(({ component, row }) => ({
      Designator: row.designator,
      "Mid X": row.mid_x.toFixed(3),
      "Mid Y": (row.mid_y * (options.flip_y_axis ? -1 : 1)).toFixed(3),
      Layer: row.layer,
      Rotation: rotations.get(component.pcb_component_id)!,
    })),
  )
}
