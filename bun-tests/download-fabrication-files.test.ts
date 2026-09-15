import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"
import { createFabricationFilesZip } from "@/lib/download-fns/download-fabrication-files"

test("fabrication zip includes plated, blind, and non-plated drill layers", async () => {
  const zipBlob = await createFabricationFilesZip({
    circuitJson: [] as AnyCircuitElement[],
    gerberConverter: {
      convertCircuitJsonToGerberFiles: () => ({
        "F_Cu.gbr": "front copper",
        "drill-L1-L2.drl": "blind plated",
        "drill-L1-L4.drl": "through plated",
        "drill_npth.drl": "non-plated",
      }),
    },
    bomConverter: {
      convertCircuitJsonToBomRows: () => [],
      convertBomRowsToCsv: () => "bom",
    },
    pnpConverter: {
      convertCircuitJsonToPickAndPlaceCsv: () => "pnp",
    },
  })

  const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer())

  expect(Object.keys(zip.files).sort()).toEqual([
    "bom.csv",
    "gerber/",
    "gerber/F_Cu.gbr",
    "gerber/drill-L1-L2.drl",
    "gerber/drill-L1-L4.drl",
    "gerber/drill_npth.drl",
    "pick_and_place.csv",
  ])
  expect(await zip.file("gerber/drill-L1-L2.drl")?.async("string")).toBe(
    "blind plated",
  )
  expect(await zip.file("gerber/drill-L1-L4.drl")?.async("string")).toBe(
    "through plated",
  )
  expect(await zip.file("gerber/drill_npth.drl")?.async("string")).toBe(
    "non-plated",
  )
})

test("fabrication download applies JLCPCB orientation frames to the exported CPL", async () => {
  const { convertCircuitJsonToPickAndPlaceCsv } = await import(
    "circuit-json-to-pnp-csv"
  )
  const circuitJson = [
    ...["Q_PD_ENABLE", "Q_BUZZER"].flatMap((name, index) => [
      {
        type: "source_component",
        source_component_id: `s${index}`,
        ftype: "simple_chip",
        name,
      },
      {
        type: "pcb_component",
        pcb_component_id: `p${index}`,
        source_component_id: `s${index}`,
        center: { x: index * 5, y: 0 },
        width: 3,
        height: 3,
        layer: "top",
        rotation: 0,
        pin1_location: index === 0 ? "leftside_top" : "rightside_bottom",
        supplier_pin1_location_map: { jlcpcb: "rightside_bottom" },
      },
    ]),
  ] as AnyCircuitElement[]
  const before = structuredClone(circuitJson)
  const blob = await createFabricationFilesZip({
    circuitJson,
    gerberConverter: {
      convertCircuitJsonToGerberFiles: () => ({
        "F_Cu.gbr": "unchanged copper",
      }),
    },
    bomConverter: {
      convertCircuitJsonToBomRows: () => [],
      convertBomRowsToCsv: () => "unchanged bom",
    },
    pnpConverter: { convertCircuitJsonToPickAndPlaceCsv },
  })
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  const cpl = await zip.file("pick_and_place.csv")!.async("string")
  expect(cpl).toContain("Q_PD_ENABLE,0.000,0.000,top,180")
  expect(cpl).toContain("Q_BUZZER,5.000,0.000,top,0")
  expect(circuitJson).toEqual(before)
  expect(await zip.file("gerber/F_Cu.gbr")!.async("string")).toBe(
    "unchanged copper",
  )
  expect(await zip.file("bom.csv")!.async("string")).toBe("unchanged bom")
})
