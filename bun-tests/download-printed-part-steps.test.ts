import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"
import { createPrintedPartStepsZip } from "@/lib/download-fns/download-printed-part-steps"

test("printed parts download contains an independent STEP per part, excluding electronics", async () => {
  const circuitJson = [
    ...["BASE", "PLATE", "SCREW"].flatMap((name, i) => [
      {
        type: "source_component",
        source_component_id: name,
        ftype: name === "SCREW" ? "part" : "printedpart",
        name,
      },
      {
        type: "cad_component",
        cad_component_id: `cad_${name}`,
        source_component_id: name,
        position: { x: 0, y: 0, z: i * 2 },
        model_jscad: { type: "cuboid", size: [10, 10, 2] },
      },
    ]),
  ] as AnyCircuitElement[]
  const before = structuredClone(circuitJson)
  const blob = await createPrintedPartStepsZip(circuitJson)
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  expect(Object.keys(zip.files)).toEqual(["BASE.step", "PLATE.step"])
  for (const name of ["BASE", "PLATE"]) {
    const step = await zip.file(`${name}.step`)!.async("string")
    expect(step).toContain("ISO-10303-21;")
    expect(step.match(/MANIFOLD_SOLID_BREP/g)).toHaveLength(1)
    expect(step).toContain(`'${name}'`)
    expect(step).not.toContain(name === "BASE" ? "'PLATE'" : "'BASE'")
    expect(step).not.toContain("SCREW")
  }
  expect(circuitJson).toEqual(before)
  await expect(createPrintedPartStepsZip([])).rejects.toThrow(
    "No assembly.printedpart",
  )
})
