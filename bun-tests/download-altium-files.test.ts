import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import JSZip from "jszip"
import { createAltiumProjectZip } from "@/lib/download-fns/download-altium-files"

test("Altium download contains native PCB and schematic documents and a project", async () => {
  const circuitJson: AnyCircuitElement[] = [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_1",
      center: { x: 0, y: 0 },
      width: 10,
      height: 10,
      num_layers: 2,
      material: "fr4",
      thickness: 1.4,
    },
  ]
  const blob = await createAltiumProjectZip(circuitJson, "example-board")
  expect(blob.type).toBe("application/zip")
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  expect(Object.keys(zip.files).sort()).toEqual([
    "README.txt",
    "example-board.PcbDoc",
    "example-board.PrjPcb",
    "example-board.SchDoc",
  ])
  for (const extension of ["PcbDoc", "SchDoc"]) {
    const bytes = await zip
      .file(`example-board.${extension}`)!
      .async("uint8array")
    expect(Array.from(bytes.slice(0, 8))).toEqual([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
    ])
  }
  const project = await zip.file("example-board.PrjPcb")!.async("string")
  expect(project).toContain("example-board.PcbDoc")
  expect(project).toContain("example-board.SchDoc")
})

test("Altium download supports keepouts with component exclusions", async () => {
  const circuitJson: AnyCircuitElement[] = [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_1",
      center: { x: 0, y: 0 },
      width: 10,
      height: 10,
      num_layers: 2,
      material: "fr4",
      thickness: 1.4,
    },
    {
      type: "source_component",
      source_component_id: "source_component_0",
      ftype: "simple_chip",
      name: "U2",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_component_0",
      source_component_id: "source_component_0",
      center: { x: 0, y: 0 },
      width: 2,
      height: 2,
      rotation: 0,
      layer: "top",
    },
    {
      type: "pcb_keepout",
      pcb_keepout_id: "pcb_keepout_4",
      shape: "rect",
      center: { x: 0, y: 0 },
      width: 3,
      height: 3,
      layers: ["top", "bottom"],
      excluded_pcb_component_ids: ["pcb_component_0"],
    },
  ]
  const blob = await createAltiumProjectZip(circuitJson, "keepout-board")
  expect(blob.type).toBe("application/zip")
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  const pcbBytes = await zip.file("keepout-board.PcbDoc")!.async("uint8array")
  const pcbText = new TextDecoder("latin1").decode(pcbBytes)
  expect(pcbText).toContain("RULEKIND=Clearance")
  expect(pcbText).toContain("SCOPE1EXPRESSION=IsKeepOut And InUnion(1)")
  expect(pcbText).toContain("SCOPE2EXPRESSION=InComponent('U2')")
  expect(zip.file("keepout-board.PrjPcb")).not.toBeNull()
  expect(zip.file("keepout-board.SchDoc")).not.toBeNull()
})
