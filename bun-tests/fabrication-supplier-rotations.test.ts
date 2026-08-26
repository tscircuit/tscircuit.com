import { expect, test } from "bun:test"
import type { AnyCircuitElement, PcbComponent } from "circuit-json"
import { convertCircuitJsonToPickAndPlaceCsv } from "circuit-json-to-pnp-csv"
import JSZip from "jszip"
import { createFabricationFilesZip } from "@/lib/download-fns/download-fabrication-files"

const pcbComponent: PcbComponent = {
  type: "pcb_component",
  pcb_component_id: "pcb_driver",
  source_component_id: "source_driver",
  center: { x: 3.875, y: -10.75 },
  width: 4.9,
  height: 7,
  layer: "top",
  rotation: 0,
  obstructs_within_bounds: true,
  pin1_location: "bottomside_left",
  supplier_pin1_location_map: { jlcpcb: "leftside_top" },
}

test("the downloaded ZIP uses JLCPCB rotations, not raw PCB rotations", async () => {
  const circuitJson: AnyCircuitElement[] = [
    {
      type: "source_component",
      ftype: "simple_chip",
      name: "DRIVER",
      source_component_id: "source_driver",
      supplier_part_numbers: { jlcpcb: ["C544361"] },
    },
    pcbComponent,
    {
      type: "source_component",
      ftype: "simple_chip",
      name: "Q_PD_ENABLE",
      source_component_id: "source_mosfet",
      supplier_part_numbers: { jlcpcb: ["C85202"] },
    },
    {
      ...pcbComponent,
      pcb_component_id: "pcb_mosfet",
      source_component_id: "source_mosfet",
      pin1_location: "leftside_top",
      supplier_pin1_location_map: { jlcpcb: "rightside_bottom" },
      center: { x: -1.625, y: -10.25 },
    },
  ]
  const before = structuredClone(circuitJson)
  const zipBlob = await createFabricationFilesZip({
    circuitJson,
    gerberConverter: {
      convertCircuitJsonToGerberFiles: (input) => {
        expect(input).toEqual(before)
        return { "F_Cu.gbr": "unchanged copper" }
      },
    },
    bomConverter: {
      convertCircuitJsonToBomRows: () => [],
      convertBomRowsToCsv: () => "bom",
    },
    pnpConverter: { convertCircuitJsonToPickAndPlaceCsv },
  })
  const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer())
  const csv = await zip.file("pick_and_place.csv")!.async("string")
  expect(csv).toContain("DRIVER,3.875,-10.750,top,90")
  expect(csv).toContain("Q_PD_ENABLE,-1.625,-10.250,top,180")
  expect(circuitJson).toEqual(before)
})
