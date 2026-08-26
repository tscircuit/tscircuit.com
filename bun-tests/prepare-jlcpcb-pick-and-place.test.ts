import { expect, mock, test } from "bun:test"
import type { AnyCircuitElement, PcbComponent } from "circuit-json"
import {
  convertCircuitJsonToPickAndPlaceCsv,
  convertCircuitJsonToPickAndPlaceRows,
} from "circuit-json-to-pnp-csv"
import JSZip from "jszip"
import { createFabricationFilesZip } from "@/lib/download-fns/download-fabrication-files"
import { prepareJlcpcbPickAndPlace } from "@/lib/download-fns/prepare-jlcpcb-pick-and-place"

// Different footprint families with different zero-degree conventions.
const sot23 = [
  [-1.1375, 0.95],
  [-1.1375, -0.95],
  [1.1375, 0],
]
const tssop = [
  ...Array.from({ length: 8 }, (_, i) => [-2.275 + i * 0.65, -2.85]),
  ...Array.from({ length: 8 }, (_, i) => [2.275 - i * 0.65, 2.85]),
  [0, 0],
]

const makeCircuit = (
  points: number[][],
  rotation = 0,
  name = "U1",
  partNumber = "C12345",
  layer: "top" | "bottom" = "top",
): AnyCircuitElement[] => {
  const angle = (rotation * Math.PI) / 180
  const center = { x: 17, y: -8 }
  return [
    {
      type: "source_component",
      ftype: "simple_chip",
      name,
      source_component_id: `source_${name}`,
      supplier_part_numbers: { jlcpcb: [partNumber] },
    },
    {
      type: "pcb_component",
      pcb_component_id: `pcb_${name}`,
      source_component_id: `source_${name}`,
      center,
      rotation,
      layer,
      width: 5,
      height: 7,
      obstructs_within_bounds: true,
    },
    ...points.map(([x, y], i) => {
      const placedX = layer === "bottom" ? -x : x
      const rotatedX = placedX * Math.cos(angle) - y * Math.sin(angle)
      const rotatedY = placedX * Math.sin(angle) + y * Math.cos(angle)
      return {
        type: "pcb_smtpad" as const,
        pcb_smtpad_id: `pad_${name}_${i + 1}`,
        pcb_component_id: `pcb_${name}`,
        layer,
        shape: "rect" as const,
        x: center.x + rotatedX,
        y: center.y + rotatedY,
        width: 0.4,
        height: 1.2,
        port_hints: [`pin${i + 1}`],
      }
    }),
  ]
}

const supplierSot23 = makeCircuit(sot23.map(([x, y]) => [-x, -y]))
const supplierTssop = makeCircuit(tssop.map(([x, y]) => [y, -x]))

test("derives missing frames for generic SOT-23 and TSSOP packages at arbitrary board rotations", async () => {
  for (const rotation of [0, 90, 180, 270, 45, -90]) {
    for (const layer of ["top", "bottom"] as const) {
      const circuitJson = [
        ...makeCircuit(sot23, rotation, "Q_TEST", "C12345", layer),
        ...makeCircuit(tssop, rotation, "U_TEST", "C67890", layer),
      ]
      const before = structuredClone(circuitJson)
      const fetchPart = mock(async (part: string) =>
        part === "C12345" ? supplierSot23 : supplierTssop,
      )
      const prepared = await prepareJlcpcbPickAndPlace(circuitJson, fetchPart)
      const rows = convertCircuitJsonToPickAndPlaceRows(prepared.circuitJson, {
        supplier: "jlcpcb",
      })
      expect(rows.map((row) => row.rotation)).toEqual([
        (rotation + 180 + 360) % 360,
        (rotation + 90 + 360) % 360,
      ])
      expect(rows.map((row) => [row.mid_x, row.mid_y, row.layer])).toEqual([
        [17, -8, layer],
        [17, -8, layer],
      ])
      expect(prepared.warnings).toEqual([])
      expect(fetchPart).toHaveBeenCalledTimes(2)
      expect(circuitJson).toEqual(before)
      expect(
        prepared.circuitJson.filter((el) => el.type !== "pcb_component"),
      ).toEqual(before.filter((el) => el.type !== "pcb_component"))
    }
  }
})

test("keeps matching footprints unchanged and reuses metadata without a network request", async () => {
  const fetchPart = mock(async () => supplierSot23)
  const circuitJson = makeCircuit(
    sot23.map(([x, y]) => [-x, -y]),
    90,
  )
  const prepared = await prepareJlcpcbPickAndPlace(circuitJson, fetchPart)
  expect(
    convertCircuitJsonToPickAndPlaceRows(prepared.circuitJson, {
      supplier: "jlcpcb",
    })[0].rotation,
  ).toBe(90)
  await prepareJlcpcbPickAndPlace(prepared.circuitJson, fetchPart)
  expect(fetchPart).toHaveBeenCalledTimes(1)
})

test("deduplicates supplier lookups within an export", async () => {
  const fetchPart = mock(async () => supplierSot23)
  const prepared = await prepareJlcpcbPickAndPlace(
    [...makeCircuit(sot23, 0, "Q1"), ...makeCircuit(sot23, 90, "Q2")],
    fetchPart,
  )
  expect(fetchPart).toHaveBeenCalledTimes(1)
  expect(
    convertCircuitJsonToPickAndPlaceRows(prepared.circuitJson, {
      supplier: "jlcpcb",
    }).map((row) => row.rotation),
  ).toEqual([180, 270])
})

test("a failed supplier lookup rejects export and is retried on the next export", async () => {
  const circuitJson = makeCircuit(sot23)
  await expect(
    prepareJlcpcbPickAndPlace(circuitJson, async () => {
      throw new Error("network offline")
    }),
  ).rejects.toThrow(/U1.*C12345.*network offline/)
  const prepared = await prepareJlcpcbPickAndPlace(
    circuitJson,
    async () => supplierSot23,
  )
  expect(prepared.warnings).toEqual([])
})

test("rejects empty supplier responses and incompatible pin numbering", async () => {
  const circuitJson = makeCircuit(sot23)
  await expect(
    prepareJlcpcbPickAndPlace(circuitJson, async () => undefined),
  ).rejects.toThrow(/U1.*Supplier footprint was not returned/)
  const reflectedSupplier = makeCircuit(sot23.map(([x, y]) => [x, -y]))
  await expect(
    prepareJlcpcbPickAndPlace(circuitJson, async () => reflectedSupplier),
  ).rejects.toThrow(/Cannot match.*U1.*by rotation/)
})

test("leaves unsupported packages explicit and does not perform unnecessary lookups", async () => {
  const circuitJson = makeCircuit([
    [-1, 0],
    [1, 0],
  ])
  const fetchPart = mock(async () => supplierSot23)
  const prepared = await prepareJlcpcbPickAndPlace(circuitJson, fetchPart)
  expect(fetchPart).not.toHaveBeenCalled()
  expect(prepared.circuitJson).toEqual(circuitJson)
  expect(prepared.warnings).toHaveLength(1)
  expect(prepared.warnings[0]).toContain("U1")
})

test("does not fetch excluded placements", async () => {
  const circuitJson = makeCircuit(sot23).map((el) =>
    el.type === "pcb_component" ? { ...el, do_not_place: true } : el,
  )
  const fetchPart = mock(async () => supplierSot23)
  const prepared = await prepareJlcpcbPickAndPlace(circuitJson, fetchPart)
  expect(fetchPart).not.toHaveBeenCalled()
  expect(prepared.warnings).toEqual([])
})

test("uses supplied local metadata when a saved file does not contain pads", async () => {
  const circuitJson = makeCircuit(sot23).filter(
    (el) => el.type !== "pcb_smtpad",
  )
  ;(circuitJson[1] as PcbComponent).pin1_location = "leftside_top"
  const prepared = await prepareJlcpcbPickAndPlace(
    circuitJson,
    async () => supplierSot23,
  )
  expect(
    convertCircuitJsonToPickAndPlaceRows(prepared.circuitJson, {
      supplier: "jlcpcb",
    })[0].rotation,
  ).toBe(180)
})

test("uses actual pad geometry instead of stale local orientation metadata", async () => {
  const circuitJson = makeCircuit(sot23, 45, "Q1", "C12345", "bottom").map(
    (el) =>
      el.type === "pcb_component"
        ? {
            ...el,
            pin1_location: "rightside_bottom" as const,
            supplier_pin1_location_map: { jlcpcb: "rightside_bottom" as const },
          }
        : el,
  )
  const fetchPart = mock(async () => supplierSot23)
  const prepared = await prepareJlcpcbPickAndPlace(circuitJson, fetchPart)
  expect(
    convertCircuitJsonToPickAndPlaceRows(prepared.circuitJson, {
      supplier: "jlcpcb",
    })[0].rotation,
  ).toBe(225)
  expect(fetchPart).not.toHaveBeenCalled()
})

test("the ZIP corrects legacy geometry and includes a manual-review list for unresolved packages", async () => {
  const circuitJson = [
    ...makeCircuit(sot23, 0, "Q1"),
    ...makeCircuit(tssop, 90, "U2", "C67890"),
    ...makeCircuit(
      [
        [-1, 0],
        [1, 0],
      ],
      0,
      "D1",
    ),
  ]
  const before = structuredClone(circuitJson)
  const fetchPart = mock(async (part: string) =>
    part === "C12345" ? supplierSot23 : supplierTssop,
  )
  const zipBlob = await createFabricationFilesZip({
    circuitJson,
    fetchSupplierPartCircuitJson: fetchPart,
    gerberConverter: {
      convertCircuitJsonToGerberFiles: (input) => {
        expect(input).toEqual(before)
        return { "F_Cu.gbr": "original copper" }
      },
    },
    bomConverter: {
      convertCircuitJsonToBomRows: () => [],
      convertBomRowsToCsv: () => "original bom",
    },
    pnpConverter: { convertCircuitJsonToPickAndPlaceCsv },
  })
  const zip = await JSZip.loadAsync(await zipBlob.arrayBuffer())
  const csv = await zip.file("pick_and_place.csv")!.async("string")
  expect(csv).toContain("Q1,17.000,-8.000,top,180")
  expect(csv).toContain("U2,17.000,-8.000,top,180")
  expect(await zip.file("placement_warnings.txt")!.async("string")).toMatch(
    /D1.*Verify this placement manually/,
  )
  expect(await zip.file("gerber/F_Cu.gbr")!.async("string")).toBe(
    "original copper",
  )
  expect(circuitJson).toEqual(before)
})
