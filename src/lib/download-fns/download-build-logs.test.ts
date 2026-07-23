import { describe, expect, test } from "bun:test"
import { formatBuildLogs } from "./download-build-logs"

describe("formatBuildLogs", () => {
  test("formats timestamped log messages as plain text", () => {
    expect(
      formatBuildLogs([
        {
          timestamp: "2026-07-22T19:29:01.202Z",
          msg: "Starting execution",
        },
        {
          timestamp: "2026-07-22T19:29:03.305Z",
          msg: "Sandbox ready",
        },
      ]),
    ).toBe(
      "2026-07-22T19:29:01.202Z Starting execution\n2026-07-22T19:29:03.305Z Sandbox ready",
    )
  })

  test("preserves plain strings and serializes unrecognized log entries", () => {
    expect(
      formatBuildLogs([
        "Installing dependencies",
        { event: "stderr", code: 1 },
        null,
      ]),
    ).toBe('Installing dependencies\n{"event":"stderr","code":1}\nnull')
  })
})
