import { expect, test } from "bun:test"
import {
  createDrawingSvg,
  createDrawingsZip,
  getDrawingSvgFileName,
} from "@/lib/download-fns/download-drawing-svg"
import JSZip from "jszip"
import { engineeringDrawingCircuitJson } from "./fixtures/engineering-drawings"

test.each([
  {
    drawingPageId: "carrier-inspection",
    title: "CARRIER INSPECTION",
    otherTitle: "CARRIER SECTION",
  },
  {
    drawingPageId: "carrier-section",
    title: "CARRIER SECTION",
    otherTitle: "CARRIER INSPECTION",
  },
])(
  "exports only the selected engineering drawing: $drawingPageId",
  async ({ drawingPageId, title, otherTitle }) => {
    const circuitJson = structuredClone(engineeringDrawingCircuitJson)
    const before = structuredClone(circuitJson)
    const blob = await createDrawingSvg({ circuitJson, drawingPageId })
    expect(blob.type).toBe("image/svg+xml")
    const svg = await blob.text()
    expect(svg).toContain("<svg")
    expect(svg).toContain(title)
    expect(svg).not.toContain(otherTitle)
    expect(svg).toContain("data:image/png;base64,")
    expect(circuitJson).toEqual(before)
  },
  20000,
)

test("rejects a missing drawing instead of downloading another page", async () => {
  await expect(
    createDrawingSvg({
      circuitJson: engineeringDrawingCircuitJson,
      drawingPageId: "missing-page",
    }),
  ).rejects.toThrow()
})

test("drawing filenames use page identities and remove path characters", () => {
  const drawingPage = engineeringDrawingCircuitJson.filter(
    (element) => element.type === "drawing_page",
  )[0]
  expect(getDrawingSvgFileName({ drawingPage, fileName: "my-board" })).toBe(
    "my-board-carrier-inspection.svg",
  )
  expect(
    getDrawingSvgFileName({
      drawingPage: {
        ...drawingPage,
        name: "../mounting/section",
        display_name: "Section",
      },
      fileName: "my/board",
    }),
  ).toBe("my-board-..-mounting-section.svg")
  expect(
    getDrawingSvgFileName({
      drawingPage: { ...drawingPage, name: undefined },
      fileName: "my-board",
    }),
  ).toBe("my-board-carrier-inspection.svg")
})

test("downloads every drawing as a separate SVG in one ZIP", async () => {
  const blob = await createDrawingsZip({
    circuitJson: engineeringDrawingCircuitJson,
    fileName: "my-board",
  })
  expect(blob.type).toBe("application/zip")
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  expect(Object.keys(zip.files).sort()).toEqual([
    "my-board-carrier-inspection.svg",
    "my-board-carrier-section.svg",
  ])
  expect(
    await zip.file("my-board-carrier-inspection.svg")!.async("string"),
  ).toContain("CARRIER INSPECTION")
  expect(
    await zip.file("my-board-carrier-section.svg")!.async("string"),
  ).toContain("CARRIER SECTION")
}, 20000)

test("retains every drawing when sanitized filenames collide", async () => {
  const circuitJson = engineeringDrawingCircuitJson.map((element) =>
    element.type === "drawing_page"
      ? {
          ...element,
          name:
            element.name === "carrier-inspection" ? "same/name" : "same name",
        }
      : element,
  )
  const blob = await createDrawingsZip({ circuitJson, fileName: "my-board" })
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  expect(Object.keys(zip.files).sort()).toEqual([
    "my-board-same-name-2.svg",
    "my-board-same-name.svg",
  ])
  expect(await zip.file("my-board-same-name.svg")!.async("string")).toContain(
    "CARRIER INSPECTION",
  )
  expect(await zip.file("my-board-same-name-2.svg")!.async("string")).toContain(
    "CARRIER SECTION",
  )
}, 20000)

test("does not create an empty drawing ZIP", async () => {
  await expect(
    createDrawingsZip({ circuitJson: [], fileName: "my-board" }),
  ).rejects.toThrow("No engineering drawings")
})
