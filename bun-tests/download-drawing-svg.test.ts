import { expect, test } from "bun:test"
import {
  createDrawingSvg,
  getDrawingSvgFileName,
} from "@/lib/download-fns/download-drawing-svg"
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
