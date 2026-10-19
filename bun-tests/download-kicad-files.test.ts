import { expect, test } from "bun:test"
import { createKicadProjectZip } from "@/lib/download-fns/create-kicad-project-zip"
import JSZip from "jszip"

test("KiCad project download includes hierarchical schematic files", async () => {
  const schematicFiles = [
    {
      filename: "musegrow.kicad_sch",
      content:
        '(kicad_sch (sheet (property "Sheetfile" "power.kicad_sch")) (sheet (property "Sheetfile" "sensors.kicad_sch")))',
    },
    {
      filename: "power.kicad_sch",
      content: '(kicad_sch (property "Reference" "U1"))',
    },
    {
      filename: "sensors.kicad_sch",
      content: '(kicad_sch (property "Reference" "U2"))',
    },
  ]
  const pcbContent = "(kicad_pcb (version 20241229))"
  const projectContent = '{"meta":{"filename":"musegrow.kicad_pro"}}'
  const modelContent = "ISO-10303-21; END-ISO-10303-21;"

  const blob = await createKicadProjectZip({
    circuitJson: [],
    fileName: "musegrow",
    converterModule: {
      CircuitJsonToKicadPcbConverter: class {
        runUntilFinished() {}
        getOutputString() {
          return pcbContent
        }
        getModel3dSourcePaths() {
          return ["sensor.step"]
        }
      },
      CircuitJsonToKicadSchConverter: class {
        runUntilFinished() {}
        getOutputString() {
          return schematicFiles[0].content
        }
        getOutputFiles({ schematicFilename }: { schematicFilename: string }) {
          expect(schematicFilename).toBe("musegrow.kicad_sch")
          return schematicFiles
        }
      },
      CircuitJsonToKicadProConverter: class {
        runUntilFinished() {}
        getOutputString() {
          return projectContent
        }
      },
      resolveAndLoadKicad3dModelFiles: async ({ onModelFile }) => {
        onModelFile({
          outputPath: "3dmodels/musegrow.3dshapes/sensor.step",
          content: modelContent,
        })
      },
    },
  })

  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  for (const schematicFile of schematicFiles) {
    expect(await zip.file(schematicFile.filename)?.async("string")).toBe(
      schematicFile.content,
    )
  }
  expect(await zip.file("musegrow.kicad_pcb")?.async("string")).toBe(pcbContent)
  expect(await zip.file("musegrow.kicad_pro")?.async("string")).toBe(
    projectContent,
  )
  expect(
    await zip.file("3dmodels/musegrow.3dshapes/sensor.step")?.async("string"),
  ).toBe(modelContent)
})
