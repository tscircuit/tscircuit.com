import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"
import { createAssemblyStepZip } from "@/lib/download-fns/download-assembly-step"
import { getPackageAssemblyCircuits } from "@/lib/download-fns/get-package-assembly-circuits"

const printedParts = (side: string): AnyCircuitElement[] => [
  {
    type: "source_component",
    source_component_id: "source_component_0",
    ftype: "printedpart",
    name: "CASE_BASE",
    manufacturer_part_number: side,
  },
  {
    type: "source_component",
    source_component_id: "source_component_1",
    ftype: "printedpart",
    name: "SWITCH_PLATE",
  },
]

const packageFixture = (contents: Record<string, string>) => {
  const packageFiles = Object.keys(contents).map((file_path, index) => ({
    file_path,
    package_file_id: `release-file-${index}`,
  }))
  const reads: string[] = []
  const readFile = async (file: (typeof packageFiles)[number]) => {
    expect(packageFiles).toContainEqual(file)
    reads.push(file.file_path)
    return contents[file.file_path]
  }
  return {
    packageFiles,
    readFile,
    reads,
    fallbackCircuitJson: [] as AnyCircuitElement[],
  }
}

test("package assembly ZIP exports every included board and skips the PCB-only preview", async () => {
  const left = printedParts("left")
  const right = printedParts("right")
  const fixture = packageFixture({
    "tscircuit.config.json": JSON.stringify({
      mainEntrypoint: "panel.circuit.json",
      includeBoardFiles: [
        "panel.circuit.json",
        "./**/*-printed-parts.circuit.tsx",
        "left-printed-parts.circuit.tsx",
      ],
    }),
    "panel.circuit.json": "[]",
    "left-printed-parts.circuit.tsx": "left source",
    "halves/right-printed-parts.circuit.tsx": "right source",
    "dist/left-printed-parts/circuit.json": JSON.stringify(left),
    "dist/halves/right-printed-parts/circuit.json": JSON.stringify(right),
    "unconfigured.circuit.json": JSON.stringify(printedParts("unused")),
    "dist/panel/circuit.json": "[]",
  })
  const conversions: AnyCircuitElement[][] = []
  const blob = await createAssemblyStepZip(
    getPackageAssemblyCircuits(fixture),
    async (circuitJson, options) => {
      expect(options).toEqual({ exportMode: "assembly" })
      conversions.push(circuitJson)
      const side = (circuitJson[0] as any).manufacturer_part_number
      return {
        "CASE_BASE.step": `${side} base`,
        "SWITCH_PLATE.step": `${side} plate`,
      }
    },
  )
  expect(conversions).toEqual([left, right])
  expect(fixture.reads).toEqual([
    "tscircuit.config.json",
    "panel.circuit.json",
    "dist/left-printed-parts/circuit.json",
    "dist/halves/right-printed-parts/circuit.json",
  ])
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  expect(
    Object.values(zip.files)
      .filter((file) => !file.dir)
      .map((file) => file.name),
  ).toEqual([
    "left-printed-parts.circuit.tsx/CASE_BASE.step",
    "left-printed-parts.circuit.tsx/SWITCH_PLATE.step",
    "halves/right-printed-parts.circuit.tsx/CASE_BASE.step",
    "halves/right-printed-parts.circuit.tsx/SWITCH_PLATE.step",
  ])
  expect(
    await zip
      .file("left-printed-parts.circuit.tsx/CASE_BASE.step")!
      .async("string"),
  ).toBe("left base")
  expect(
    await zip
      .file("halves/right-printed-parts.circuit.tsx/CASE_BASE.step")!
      .async("string"),
  ).toBe("right base")
})

test("included Circuit JSON is read directly, without matching dist outputs again", async () => {
  const fixture = packageFixture({
    "tscircuit.config.json": JSON.stringify({
      includeBoardFiles: ["**/*.circuit.json"],
    }),
    "left.circuit.json": JSON.stringify(printedParts("left")),
    "dist/left/duplicate.circuit.json": JSON.stringify(printedParts("left")),
  })
  const circuits = []
  for await (const circuit of getPackageAssemblyCircuits(fixture)) {
    circuits.push(circuit)
  }
  expect(circuits).toEqual([
    { filePath: "left.circuit.json", circuitJson: printedParts("left") },
  ])
  expect(fixture.reads).toEqual(["tscircuit.config.json", "left.circuit.json"])
})

test.each([undefined, {}, { includeBoardFiles: [] }])(
  "without includeBoardFiles the existing preview remains the assembly input (%j)",
  async (config) => {
    const fixture = packageFixture(
      config ? { "tscircuit.config.json": JSON.stringify(config) } : {},
    )
    fixture.fallbackCircuitJson = printedParts("preview")
    const circuits = []
    for await (const circuit of getPackageAssemblyCircuits(fixture)) {
      circuits.push(circuit)
    }
    expect(circuits).toEqual([{ circuitJson: fixture.fallbackCircuitJson }])
    const blob = await createAssemblyStepZip(circuits, async () => ({
      "CASE_BASE.step": "preview base",
    }))
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    expect(Object.keys(zip.files)).toEqual(["CASE_BASE.step"])
  },
)

test("missing included board output fails instead of downloading an incomplete assembly", async () => {
  const fixture = packageFixture({
    "tscircuit.config.json": JSON.stringify({
      includeBoardFiles: ["left.board.tsx", "right.board.tsx"],
    }),
    "left.board.tsx": "left source",
    "right.board.tsx": "right source",
    "dist/left/circuit.json": JSON.stringify(printedParts("left")),
  })
  await expect(
    createAssemblyStepZip(getPackageAssemblyCircuits(fixture), async () => ({
      "CASE_BASE.step": "left base",
    })),
  ).rejects.toThrow("Circuit JSON for right.board.tsx is missing")
})

test("invalid included Circuit JSON produces an error", async () => {
  const fixture = packageFixture({
    "tscircuit.config.json": JSON.stringify({
      includeBoardFiles: ["left.circuit.json"],
    }),
    "left.circuit.json": "{}",
  })
  await expect(
    createAssemblyStepZip(getPackageAssemblyCircuits(fixture)),
  ).rejects.toThrow("Invalid Circuit JSON for left.circuit.json")
})

test("a package with no printed parts reports that there is nothing to export", async () => {
  let converterCalled = false
  await expect(
    createAssemblyStepZip([{ circuitJson: [] }], async () => {
      converterCalled = true
      return {}
    }),
  ).rejects.toThrow("No assembly.printedpart elements found to export")
  expect(converterCalled).toBe(false)
})

test("printed part conversion errors are not silently skipped", async () => {
  await expect(
    createAssemblyStepZip(
      [{ filePath: "left.circuit.tsx", circuitJson: printedParts("left") }],
      async () => {
        throw new Error("Invalid printed part geometry")
      },
    ),
  ).rejects.toThrow("Invalid printed part geometry")
})
