import { describe, expect, test } from "bun:test"
import {
  getCodePreview,
  MAX_CODE_PREVIEW_CHARACTERS,
  MAX_CODE_PREVIEW_LINES,
} from "../src/lib/code-preview"
import {
  MAX_CIRCUIT_JSON_PREVIEW_CHARACTERS,
  parseCircuitJsonPreview,
} from "../src/lib/circuit-json-preview"

describe("code preview budgets", () => {
  test("preserves small files verbatim", () => {
    const code = '{\n  "name": "R1"\n}\n'
    expect(getCodePreview(code)).toEqual({ code, isTruncated: false })
    expect(getCodePreview("")).toEqual({ code: "", isTruncated: false })
  })

  test("bounds a generated JSON file before it reaches the highlighter", () => {
    const code = JSON.stringify(
      Array.from({ length: 20000 }, (_, i) => ({ name: `R${i}`, x: i })),
      null,
      2,
    )
    const preview = getCodePreview(code)
    expect(preview.isTruncated).toBe(true)
    expect(preview.code.split("\n").length).toBeLessThanOrEqual(
      MAX_CODE_PREVIEW_LINES,
    )
    expect(preview.code.length).toBeLessThanOrEqual(MAX_CODE_PREVIEW_CHARACTERS)
    expect(code.startsWith(preview.code)).toBe(true)
    expect(code).toContain("R19999")
    expect(preview.code).not.toContain("R19999")
  })

  test("also bounds minified files and very long lines", () => {
    const code = "x".repeat(MAX_CODE_PREVIEW_CHARACTERS * 10)
    expect(getCodePreview(code)).toEqual({
      code: code.slice(0, MAX_CODE_PREVIEW_CHARACTERS),
      isTruncated: true,
    })
    const exact = "x".repeat(MAX_CODE_PREVIEW_CHARACTERS)
    expect(getCodePreview(exact)).toEqual({ code: exact, isTruncated: false })
  })

  test("does not split a Unicode character at the boundary", () => {
    const code = `${"x".repeat(MAX_CODE_PREVIEW_CHARACTERS - 1)}😀`
    expect(getCodePreview(code)).toEqual({
      code: "x".repeat(MAX_CODE_PREVIEW_CHARACTERS - 1),
      isTruncated: true,
    })
  })
})

describe("circuit preview budgets", () => {
  test("rejects oversized data before attempting JSON parsing", () => {
    expect(
      parseCircuitJsonPreview(
        "[".repeat(MAX_CIRCUIT_JSON_PREVIEW_CHARACTERS + 1),
      ),
    ).toEqual({ status: "too-large" })
  })

  test("keeps small complete circuits and handles invalid or absent files", () => {
    const circuitJson = [{ type: "pcb_board", width: 10, height: 10 }]
    expect(parseCircuitJsonPreview(JSON.stringify(circuitJson))).toEqual({
      status: "ready",
      circuitJson,
    })
    for (const content of [null, undefined, "", "invalid", "{}"])
      expect(parseCircuitJsonPreview(content)).toEqual({
        status: "unavailable",
      })
  })
})
