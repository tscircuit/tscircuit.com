import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"
import { createStepDownload } from "@/lib/download-fns/download-step"

test("default STEP download separates printed parts and keeps PCB-only output as STEP", async () => {
  const circuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board",
      center: { x: 0, y: 0 },
      width: 20,
      height: 10,
      thickness: 1.6,
    },
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
  const { blob, extension } = await createStepDownload(circuitJson)
  expect(extension).toBe("zip")
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
  const pcb = await createStepDownload([circuitJson[0]])
  expect(pcb.extension).toBe("step")
  expect(await pcb.blob.text()).toContain("ISO-10303-21;")
  const assembly = await createStepDownload(circuitJson, {
    exportMode: "assembly",
  })
  expect(
    Object.keys(
      (await JSZip.loadAsync(await assembly.blob.arrayBuffer())).files,
    ),
  ).toEqual(["BASE.step", "PLATE.step"])
  await expect(
    createStepDownload([], { exportMode: "assembly" }),
  ).rejects.toThrow("No assembly.printedpart")
})
