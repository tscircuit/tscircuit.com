import { describe, expect, it } from "bun:test"
import { hasUnauthorizedSourcePartWarning } from "./has-unauthorized-source-part-warning"

describe("hasUnauthorizedSourcePartWarning", () => {
  it("detects a source part request rejected with HTTP 401", () => {
    expect(
      hasUnauthorizedSourcePartWarning([
        {
          type: "source_part_not_found_warning",
          message:
            'Failed to fetch circuit JSON for <connector#18 name=".J1" /> (standard="usb_c"): Failed to search for the component (HTTP 401)',
        },
      ]),
    ).toBe(true)
  })

  it("does not depend on the source part provider's error text", () => {
    expect(
      hasUnauthorizedSourcePartWarning([
        {
          type: "source_part_not_found_warning",
          message: "The source part request failed (HTTP 401)",
        },
      ]),
    ).toBe(true)
  })

  it("ignores source part failures with no HTTP 401 status", () => {
    expect(
      hasUnauthorizedSourcePartWarning([
        {
          type: "source_part_not_found_warning",
          message: "Failed to search for the component",
        },
        {
          type: "source_part_not_found_error",
          message: "The source part request failed (HTTP 401)",
        },
      ]),
    ).toBe(false)
  })
})
