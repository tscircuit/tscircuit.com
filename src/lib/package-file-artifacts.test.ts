import { describe, expect, test } from "bun:test"
import { getPackageFileArtifactPaths } from "./package-file-artifacts"

const files = (...filePaths: string[]) =>
  filePaths.map((file_path) => ({ file_path }))

describe("getPackageFileArtifactPaths", () => {
  test("finds SVG and circuit JSON artifacts beside the selected file", () => {
    expect(
      getPackageFileArtifactPaths(
        "examples/blinky/index.tsx",
        files(
          "examples/blinky/index.tsx",
          "examples/blinky/pcb.svg",
          "examples/blinky/schematic.svg",
          "examples/blinky/circuit.json",
        ),
      ),
    ).toEqual({
      pcbSvgPath: "examples/blinky/pcb.svg",
      schematicSvgPath: "examples/blinky/schematic.svg",
      circuitJsonPath: "examples/blinky/circuit.json",
    })
  })

  test("maps a source file to its generated dist artifact directory", () => {
    expect(
      getPackageFileArtifactPaths(
        "/src/boards/blinky.board.tsx",
        files("dist/src/boards/blinky.board/circuit.json"),
      ),
    ).toEqual({
      circuitJsonPath: "dist/src/boards/blinky.board/circuit.json",
    })
  })

  test("supports named PCB and abbreviated schematic SVG artifacts", () => {
    expect(
      getPackageFileArtifactPaths(
        "dist/index/circuit.json",
        files(
          "dist/index/board-pcb.svg",
          "dist/index/board.sch.svg",
          "dist/index/circuit.json",
        ),
      ),
    ).toEqual({
      pcbSvgPath: "dist/index/board-pcb.svg",
      schematicSvgPath: "dist/index/board.sch.svg",
      circuitJsonPath: "dist/index/circuit.json",
    })
  })

  test("uses dist/circuit.json as a root source fallback", () => {
    expect(
      getPackageFileArtifactPaths(
        "index.tsx",
        files("index.tsx", "/dist/circuit.json"),
      ),
    ).toEqual({ circuitJsonPath: "dist/circuit.json" })
  })

  test("does not use an artifact from an unrelated directory", () => {
    expect(
      getPackageFileArtifactPaths(
        "src/button.tsx",
        files("examples/button/circuit.json"),
      ),
    ).toEqual({})
  })
})
