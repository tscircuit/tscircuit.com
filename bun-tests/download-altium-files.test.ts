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
