import { describe, expect, test } from "bun:test"
import { isReleaseInstallable } from "../utils/isReleaseInstallable"

describe("isReleaseInstallable", () => {
  test("returns true when the release has a transpiled artifact", () => {
    expect(isReleaseInstallable({ has_transpiled: true })).toBe(true)
  })

  test("returns false when transpilation never completed", () => {
    expect(isReleaseInstallable({ has_transpiled: false })).toBe(false)
  })

  test("returns false when has_transpiled is null (e.g. release created before the field existed)", () => {
    expect(isReleaseInstallable({ has_transpiled: null })).toBe(false)
  })

  test("returns false when has_transpiled is missing", () => {
    expect(isReleaseInstallable({})).toBe(false)
  })

  test("returns false for nullish releases (still loading / none selected)", () => {
    expect(isReleaseInstallable(null)).toBe(false)
    expect(isReleaseInstallable(undefined)).toBe(false)
  })
})
