import { expect, mock, test } from "bun:test"
import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import type { AnyCircuitElement, PcbComponent } from "circuit-json"
import * as pnpConverter from "circuit-json-to-pnp-csv"
import JSZip from "jszip"
import Papa from "papaparse"
import { createFabricationFilesZip } from "@/lib/download-fns/download-fabrication-files"
import { createSupplierPnpCsv } from "@/lib/fabrication/create-supplier-pnp-csv"

const fixture = JSON.parse(
  gunzipSync(
    readFileSync(new URL("./fixtures/nema23-pnp.json.gz", import.meta.url)),
  ).toString(),
) as {
  board: AnyCircuitElement[]
  supplier_footprints: Record<string, AnyCircuitElement[]>
}
const options = () => ({
  supplier: "jlcpcb" as const,
  partsEngine: {
    fetchPartCircuitJson: mock(
      async ({ supplierPartNumber }: { supplierPartNumber?: string }) => {
        const data = fixture.supplier_footprints[supplierPartNumber!]
        if (!data)
          throw new Error(`Unrecorded supplier lookup: ${supplierPartNumber}`)
        return structuredClone(data)
      },
    ),
  },
})
const parse = (csv: string) =>
  Papa.parse<Record<string, string>>(csv, { header: true }).data

// This is a placement-only reduction of the exact published v1.4.15 board,
// with actual supplier CAD responses recorded through JlcPcbPartsEngine.
test("NEMA-23 fabrication ZIP includes all 136 verified PnP rows", async () => {
  const board = structuredClone(fixture.board)
  const before = structuredClone(board)
  const orientationOptions = options()
  expect(() =>
    pnpConverter.convertCircuitJsonToPickAndPlaceCsv(board, {
      supplier: "jlcpcb",
    }),
  ).toThrow("U1: cannot verify jlcpcb")
  const blob = await createFabricationFilesZip({
    circuitJson: board,
    pnpConverter,
    orientationOptions,
    gerberConverter: {
      convertCircuitJsonToGerberFiles: () => ({
        "F_Cu.gbr": "unchanged copper",
      }),
    },
    bomConverter: {
      convertCircuitJsonToBomRows: () => [],
      convertBomRowsToCsv: () => "unchanged bom",
    },
  })
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  expect(zip.file("pick_and_place.csv")).not.toBeNull()
  const rows = parse(await zip.file("pick_and_place.csv")!.async("string"))
  const originalRows = pnpConverter.convertCircuitJsonToPickAndPlaceRows(board)
  expect(rows).toHaveLength(136)
  expect(
    rows.map((row) => [row.Designator, row["Mid X"], row["Mid Y"], row.Layer]),
  ).toEqual(
    originalRows.map((row) => [
      row.designator,
      row.mid_x.toFixed(3),
      row.mid_y.toFixed(3),
      row.layer,
    ]),
  )
  const rotation = (name: string) =>
    Number(rows.find((row) => row.Designator === name)!.Rotation)
  expect(rotation("U1")).toBe(0)
  expect(rotation("J_USB")).toBe(180)
  expect(rotation("J_MOTOR")).toBe(0)
  expect(rotation("U_PD_BUFFER")).toBe(0)
  expect(rotation("D_PWR")).toBe(0)
  expect(rotation("U_EFUSE")).toBe(0)
  expect(rotation("U_TEMP")).toBe(90)
  expect(
    orientationOptions.partsEngine.fetchPartCircuitJson,
  ).toHaveBeenCalledTimes(56)
  expect(zip.file("placement_warnings.txt")).toBeNull()
  expect(await zip.file("gerber/F_Cu.gbr")!.async("string")).toBe(
    "unchanged copper",
  )
  expect(await zip.file("bom.csv")!.async("string")).toBe("unchanged bom")
  expect(board).toEqual(before)
})

const componentCircuit = (name: string) => {
  const source = fixture.board.find(
    (e) => e.type === "source_component" && e.name === name,
  )!
  if (source.type !== "source_component")
    throw new Error("missing fixture source")
  const component = fixture.board.find(
    (e): e is PcbComponent =>
      e.type === "pcb_component" &&
      e.source_component_id === source.source_component_id,
  )!
  return structuredClone(
    fixture.board.filter(
      (e) =>
        e === source ||
        e === component ||
        ("pcb_component_id" in e &&
          e.pcb_component_id === component.pcb_component_id) ||
        ("source_component_id" in e &&
          e.source_component_id === source.source_component_id),
    ),
  )
}

for (const [name, initial] of [
  ["J_USB", 180],
  ["J_MOTOR", 0],
  ["U_PD_BUFFER", 0],
] as const) {
  for (const degrees of [0, 90, 180, 270, 45, -90]) {
    test(`${name} resolves actual supplier pads at PCB rotation ${degrees}`, async () => {
      const board = componentCircuit(name)
      const radians = (degrees * Math.PI) / 180
      const rotate = ({ x, y }: { x: number; y: number }) => ({
        x: x * Math.cos(radians) - y * Math.sin(radians),
        y: x * Math.sin(radians) + y * Math.cos(radians),
      })
      for (const element of board) {
        if (element.type === "pcb_component") {
          element.center = rotate(element.center)
          if (element.footprint_origin)
            element.footprint_origin = rotate(element.footprint_origin)
          element.rotation += degrees
        } else if (element.type === "pcb_smtpad" && element.shape === "polygon")
          element.points = element.points.map(rotate)
        else if (
          "x" in element &&
          "y" in element &&
          typeof element.x === "number" &&
          typeof element.y === "number"
        )
          Object.assign(element, rotate({ x: element.x, y: element.y }))
      }
      const before = structuredClone(board)
      const rows = parse(
        await createSupplierPnpCsv(board, pnpConverter, options()),
      )
      expect(rows).toHaveLength(1)
      expect(Number(rows[0]!.Rotation)).toBe(
        (((initial + degrees) % 360) + 360) % 360,
      )
      expect(board).toEqual(before)
    })
  }
}

test("supplier pad matching rejects a reflection instead of exporting a fallback", async () => {
  const opts = options()
  opts.partsEngine.fetchPartCircuitJson = mock(async ({ supplierPartNumber }) =>
    structuredClone(fixture.supplier_footprints[supplierPartNumber!]!).map(
      (e) => ("x" in e && typeof e.x === "number" ? { ...e, x: -e.x } : e),
    ),
  )
  await expect(
    createSupplierPnpCsv(componentCircuit("J_MOTOR"), pnpConverter, opts),
  ).rejects.toThrow("cannot match authored and supplier pad orientation")
})

test("failed supplier lookup rejects the complete archive", async () => {
  await expect(
    createFabricationFilesZip({
      circuitJson: componentCircuit("U1"),
      pnpConverter,
      orientationOptions: {
        partsEngine: {
          fetchPartCircuitJson: async () => {
            throw new Error("supplier offline")
          },
        },
      },
      gerberConverter: { convertCircuitJsonToGerberFiles: () => ({}) },
      bomConverter: {
        convertCircuitJsonToBomRows: () => [],
        convertBomRowsToCsv: () => "bom",
      },
    }),
  ).rejects.toThrow("U1: supplier offline")
})

test("unverified bottom-side JSON requires explicit metadata", async () => {
  const board = componentCircuit("J_MOTOR")
  const component = board.find(
    (e): e is PcbComponent => e.type === "pcb_component",
  )!
  component.layer = "bottom"
  const opts = options()
  await expect(createSupplierPnpCsv(board, pnpConverter, opts)).rejects.toThrow(
    "bottom-side JSON requires verified",
  )
  expect(opts.partsEngine.fetchPartCircuitJson).not.toHaveBeenCalled()
})

test("pad geometry resolves a footprint rotated inside a zero-degree component", async () => {
  const board = componentCircuit("J_MOTOR")
  for (const e of board) {
    if (e.type !== "pcb_plated_hole") continue
    const x = e.x - 6.8
    const y = e.y + 22
    e.x = 6.8 - y
    e.y = -22 + x
  }
  const rows = parse(await createSupplierPnpCsv(board, pnpConverter, options()))
  expect(Number(rows[0]!.Rotation)).toBe(90)
})

test("supplier lookups are bounded to four concurrent requests", async () => {
  let active = 0
  let peak = 0
  const opts = options()
  opts.partsEngine.fetchPartCircuitJson = mock(
    async ({ supplierPartNumber }) => {
      active++
      peak = Math.max(peak, active)
      await new Promise((resolve) => setTimeout(resolve, 0))
      active--
      return structuredClone(fixture.supplier_footprints[supplierPartNumber!]!)
    },
  )
  const rows = parse(
    await createSupplierPnpCsv(
      structuredClone(fixture.board),
      pnpConverter,
      opts,
    ),
  )
  expect(rows).toHaveLength(136)
  expect(peak).toBe(4)
  expect(opts.partsEngine.fetchPartCircuitJson).toHaveBeenCalledTimes(56)
})

test("failed lookups can be retried by the next export", async () => {
  const board = componentCircuit("U1")
  let attempts = 0
  const opts = options()
  opts.partsEngine.fetchPartCircuitJson = mock(
    async ({ supplierPartNumber }) => {
      if (++attempts === 1) throw new Error("temporary failure")
      return structuredClone(fixture.supplier_footprints[supplierPartNumber!]!)
    },
  )
  await expect(createSupplierPnpCsv(board, pnpConverter, opts)).rejects.toThrow(
    "temporary failure",
  )
  expect(
    parse(await createSupplierPnpCsv(board, pnpConverter, opts)),
  ).toHaveLength(1)
  expect(attempts).toBe(2)
})

test("explicit bottom-side supplier frames export offline", async () => {
  const board = componentCircuit("J_MOTOR")
  const component = board.find(
    (e): e is PcbComponent => e.type === "pcb_component",
  )!
  component.layer = "bottom"
  component.pin1_location = "bottomside_left"
  component.supplier_pin1_location_map = { jlcpcb: "bottomside_left" }
  const opts = { ...options(), partsEngineDisabled: true }
  const rows = parse(await createSupplierPnpCsv(board, pnpConverter, opts))
  expect(rows[0]!.Layer).toBe("bottom")
  expect(Number(rows[0]!.Rotation)).toBe(0)
  expect(opts.partsEngine.fetchPartCircuitJson).not.toHaveBeenCalled()
})

test("conflicting semantic pad aliases cannot fall back to matching numeric indices", async () => {
  const board = componentCircuit("J_MOTOR")
  for (const e of board) {
    if (e.type !== "source_port") continue
    e.port_hints = e.pin_number === 1 ? ["A"] : e.pin_number === 2 ? ["B"] : []
  }
  const opts = options()
  opts.partsEngine.fetchPartCircuitJson = mock(async ({ supplierPartNumber }) =>
    structuredClone(fixture.supplier_footprints[supplierPartNumber!]!).map(
      (e) =>
        e.type === "source_port"
          ? { ...e, port_hints: e.pin_number === 1 ? ["A", "B"] : [] }
          : e,
    ),
  )
  await expect(createSupplierPnpCsv(board, pnpConverter, opts)).rejects.toThrow(
    "cannot match authored and supplier pad orientation",
  )
})
