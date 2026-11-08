import { expect, test } from "bun:test"
import {
  getDefaultPreviewFilePath,
  getPreviewCircuitFiles,
} from "@/lib/preview-circuit-files"

const files = (...paths: string[]) => paths.map((file_path) => ({ file_path }))

test("lists Circuit JSON outputs without treating other JSON files or dependencies as previews", () => {
  const input = files(
    "package.json",
    "dist/board/pcb.svg",
    "/dist/index/circuit.json",
    "./dist/led.circuit.json",
    "node_modules/example/circuit.json",
    "dist/unbuilt.json",
  )
  expect(getPreviewCircuitFiles(input).map((file) => file.file_path)).toEqual([
    "/dist/index/circuit.json",
    "./dist/led.circuit.json",
  ])
  expect(input).toHaveLength(6)
})

test("matches the configured default entrypoint and legacy root output", () => {
  expect(
    getDefaultPreviewFilePath(
      files("dist/led/circuit.json", "dist/index/circuit.json"),
      "led.circuit.tsx",
    ),
  ).toBe("dist/led/circuit.json")
  expect(getDefaultPreviewFilePath(files("/dist/circuit.json"))).toBe(
    "dist/circuit.json",
  )
  expect(
    getDefaultPreviewFilePath(files("dist/other/circuit.json"), "missing.tsx"),
  ).toBeUndefined()
})
