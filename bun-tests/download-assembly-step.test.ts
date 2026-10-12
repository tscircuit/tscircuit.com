import { expect, spyOn, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import * as fileSaver from "file-saver"
import JSZip from "jszip"
import { downloadAssemblyStepFile } from "@/lib/download-fns/download-assembly-step"

test("Assembly STEP downloads separate printed parts in a ZIP", async () => {
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
  const saveAs = spyOn(fileSaver, "saveAs").mockReturnValue(undefined)
  try {
    await downloadAssemblyStepFile(circuitJson, "corne-left")
    expect(saveAs).toHaveBeenCalledTimes(1)
    const [blob, fileName] = saveAs.mock.calls[0]
    expect(fileName).toBe("corne-left-assembly.zip")
    expect(blob).toBeInstanceOf(Blob)
    const zip = await JSZip.loadAsync(await (blob as Blob).arrayBuffer())
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
    await expect(downloadAssemblyStepFile([], "empty")).rejects.toThrow(
      "No assembly.printedpart",
    )
    expect(saveAs).toHaveBeenCalledTimes(1)
  } finally {
    saveAs.mockRestore()
  }
})
