import { expect, test } from "bun:test"
import JSZip from "jszip"
import { createKicadProjectZip } from "@/lib/download-fns/download-kicad-files"

const cases = [
  {
    name: "KiCad ZIP includes all seven child schematics referenced by the root",
    fileName: "board",
    childFilenames: [
      "power.kicad_sch",
      "controller.kicad_sch",
      "display.kicad_sch",
      "sensors.kicad_sch",
      "interface.kicad_sch",
      "radio.kicad_sch",
      "usb.kicad_sch",
    ],
  },
  {
    name: "KiCad ZIP preserves a single-sheet project",
    fileName: "single-sheet",
    childFilenames: [],
  },
  {
    name: "KiCad ZIP preserves a child filename renamed to avoid the root",
    fileName: "index",
    childFilenames: ["index_2.kicad_sch"],
  },
]

for (const { name, fileName, childFilenames } of cases) {
  test(name, async () => {
    const schematicFiles = [
      {
        filename: `${fileName}.kicad_sch`,
        content: `(kicad_sch ${childFilenames
          .map((filename) => `(sheet (property "Sheetfile" "${filename}"))`)
          .join(" ")})`,
      },
      ...childFilenames.map((filename) => ({
        filename,
        content: `(kicad_sch (title_block (title "${filename}")))`,
      })),
    ]
    const pcbContent = "(kicad_pcb (version 20241229))"
    const proContent = JSON.stringify({
      project: { files: { schematic: `${fileName}.kicad_sch` } },
    })
    const modelPath = "3dmodels/example.3dshapes/resistor.step"
    const modelContent = "ISO-10303-21; END-ISO-10303-21;"

    const blob = await createKicadProjectZip({
      circuitJson: [],
      fileName,
      kicadConverter: {
        CircuitJsonToKicadPcbConverter: class {
          runUntilFinished() {}
          getOutputString() {
            return pcbContent
          }
          getModel3dSourcePaths() {
            return ["resistor.step"]
          }
        },
        CircuitJsonToKicadSchConverter: class {
          runUntilFinished() {}
          getOutputString() {
            return schematicFiles[0].content
          }
          getOutputFiles(options: { schematicFilename: string }) {
            expect(options.schematicFilename).toBe(`${fileName}.kicad_sch`)
            return schematicFiles
          }
        },
        CircuitJsonToKicadProConverter: class {
          runUntilFinished() {}
          getOutputString() {
            return proContent
          }
        },
        resolveAndLoadKicad3dModelFiles: async ({
          projectName,
          model3dSourcePaths,
          onModelFile,
        }) => {
          expect(projectName).toBe(fileName)
          expect(model3dSourcePaths).toEqual(["resistor.step"])
          await onModelFile({
            sourcePath: "resistor.step",
            outputPath: modelPath,
            content: new TextEncoder().encode(modelContent),
          })
        },
      },
    })

    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    expect(
      Object.keys(zip.files)
        .filter((filename) => filename.endsWith(".kicad_sch"))
        .sort(),
    ).toEqual(schematicFiles.map((file) => file.filename).sort())
    for (const { filename, content } of schematicFiles) {
      expect(await zip.file(filename)?.async("string")).toBe(content)
    }
    const root = await zip.file(`${fileName}.kicad_sch`)!.async("string")
    for (const [, childFilename] of root.matchAll(
      /\(property "Sheetfile" "([^"]+)"\)/g,
    )) {
      expect(zip.file(childFilename)).not.toBeNull()
    }
    expect(await zip.file(`${fileName}.kicad_pcb`)?.async("string")).toBe(
      pcbContent,
    )
    expect(await zip.file(`${fileName}.kicad_pro`)?.async("string")).toBe(
      proContent,
    )
    expect(await zip.file(modelPath)?.async("string")).toBe(modelContent)
  })
}
