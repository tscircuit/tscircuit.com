import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"
import { createFabricationFilesZip } from "@/lib/download-fns/download-fabrication-files"
import unverifiedU1 from "./fixtures/nema23-unverified-u1.json"

test("NEMA-23 v1.4.15 can download fabrication files when U1 has no supplier orientation", async () => {
  const pnpConverter = await import("circuit-json-to-pnp-csv")
  // Extracted unchanged from imrishabh18/nema-23-stepper-controller v1.4.15.
  const circuitJson = unverifiedU1 as AnyCircuitElement[]
  const before = structuredClone(circuitJson)
  expect(() =>
    pnpConverter.convertCircuitJsonToPickAndPlaceCsv(circuitJson, {
      supplier: "jlcpcb",
    }),
  ).toThrow(
    "U1: cannot verify jlcpcb pick-and-place rotation (missing_supplier_pin1_location); PCB rotation 0 is unverified.",
  )

  const warnings: string[] = []
  const blob = await createFabricationFilesZip({
    circuitJson,
    gerberConverter: {
      convertCircuitJsonToGerberFiles: () => ({ "F_Cu.gbr": "copper" }),
    },
    bomConverter: {
      convertCircuitJsonToBomRows: () => [],
      convertBomRowsToCsv: () => "bom",
    },
    pnpConverter,
    onPlacementWarnings: (items) =>
      warnings.push(...items.map((item) => item.message)),
  })
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  expect(await zip.file("gerber/F_Cu.gbr")!.async("string")).toBe("copper")
  expect(await zip.file("bom.csv")!.async("string")).toBe("bom")
  expect(zip.file("pick_and_place.csv")).toBeNull()
  const report = await zip.file("placement_warnings.txt")!.async("string")
  expect(report).toContain("Pick-and-place file omitted")
  expect(report).toContain("missing_supplier_pin1_location")
  expect(report).toContain("U1: cannot verify jlcpcb")
  expect(warnings).toHaveLength(1)
  expect(warnings[0]).toContain("U1: cannot verify jlcpcb")
  expect(circuitJson).toEqual(before)
})

test("placement report lists every unresolved fitted component without exporting fallback angles", async () => {
  const pnpConverter = await import("circuit-json-to-pnp-csv")
  const circuitJson = structuredClone(unverifiedU1) as AnyCircuitElement[]
  circuitJson.push(
    {
      ...unverifiedU1[0],
      source_component_id: "source_component_1",
      name: "U2",
    } as AnyCircuitElement,
    {
      ...unverifiedU1[1],
      source_component_id: "source_component_1",
      pcb_component_id: "pcb_component_1",
      pin1_location: undefined,
    } as AnyCircuitElement,
    {
      ...unverifiedU1[0],
      source_component_id: "source_dnp",
      name: "DNP",
    } as AnyCircuitElement,
    {
      ...unverifiedU1[1],
      source_component_id: "source_dnp",
      pcb_component_id: "pcb_dnp",
      do_not_place: true,
    } as AnyCircuitElement,
  )
  const blob = await createFabricationFilesZip({
    circuitJson,
    gerberConverter: { convertCircuitJsonToGerberFiles: () => ({}) },
    bomConverter: {
      convertCircuitJsonToBomRows: () => [],
      convertBomRowsToCsv: () => "bom",
    },
    pnpConverter,
  })
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  const report = await zip.file("placement_warnings.txt")!.async("string")
  expect(report).toContain("U1: cannot verify jlcpcb")
  expect(report).toContain("U2: cannot verify jlcpcb")
  expect(report).toContain("missing_pin1_location")
  expect(report).not.toContain("DNP")
  expect(zip.file("pick_and_place.csv")).toBeNull()
})

test("unexpected placement converter failures still reject the download", async () => {
  const error = new Error("unexpected converter failure")
  let warned = false
  await expect(
    createFabricationFilesZip({
      circuitJson: [],
      gerberConverter: { convertCircuitJsonToGerberFiles: () => ({}) },
      bomConverter: {
        convertCircuitJsonToBomRows: () => [],
        convertBomRowsToCsv: () => "bom",
      },
      pnpConverter: {
        convertCircuitJsonToPickAndPlaceCsv: async () => {
          throw error
        },
      },
      onPlacementWarnings: () => {
        warned = true
      },
    }),
  ).rejects.toBe(error)
  expect(warned).toBe(false)
})

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
  expect(zip.file("placement_warnings.txt")).toBeNull()
  expect(circuitJson).toEqual(before)
  expect(await zip.file("gerber/F_Cu.gbr")!.async("string")).toBe(
    "unchanged copper",
  )
  expect(await zip.file("bom.csv")!.async("string")).toBe("unchanged bom")
})
