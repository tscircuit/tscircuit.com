import { expect, test } from "bun:test"
import { getFilePathConflict } from "@/lib/utils/getFilePathConflict"

const existingFilePaths = ["index.tsx", "lib/resistor.tsx"]

test("getFilePathConflict allows a new file beside the existing ones", () => {
  expect(getFilePathConflict("lib/capacitor.tsx", existingFilePaths)).toBe(null)
  expect(getFilePathConflict("library", existingFilePaths)).toBe(null)
})

test("getFilePathConflict rejects a file that already exists", () => {
  expect(getFilePathConflict("index.tsx", existingFilePaths)).toBe(
    "File 'index.tsx' already exists",
  )
})

test("getFilePathConflict rejects a file named like an existing folder", () => {
  expect(getFilePathConflict("lib", existingFilePaths)).toBe(
    "A folder named 'lib' already exists",
  )
})

test("getFilePathConflict rejects a file inside an existing file", () => {
  expect(getFilePathConflict("index.tsx/pin.tsx", existingFilePaths)).toBe(
    "'index.tsx' is a file, so it can't contain 'index.tsx/pin.tsx'",
  )
})
