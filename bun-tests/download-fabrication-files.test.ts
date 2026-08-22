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
