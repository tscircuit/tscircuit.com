import { describe, expect, it } from "bun:test"
import { isDownloadOnlyPackageFile } from "./is-download-only-package-file"

describe("isDownloadOnlyPackageFile", () => {
  it("marks STEP files as download-only assets", () => {
    expect(isDownloadOnlyPackageFile("assets/model.step")).toBe(true)
    expect(isDownloadOnlyPackageFile("assets/model.STP")).toBe(true)
  })

  it("does not mark editable source files as download-only", () => {
    expect(isDownloadOnlyPackageFile("index.tsx")).toBe(false)
    expect(isDownloadOnlyPackageFile("dist/circuit.json")).toBe(false)
  })
})
