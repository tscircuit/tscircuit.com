import { describe, expect, test } from "bun:test"
import { TSCI_PACKAGE_PATTERN } from "../constants"

describe("TSCI_PACKAGE_PATTERN", () => {
  // Test valid patterns
  const validPackages = [
    "@tsci/basic",
    "@tsci/package-name",
    "@tsci/multiple-dashes-here",
    "@tsci/package.subpackage",
    "@tsci/complex-package.complex-subpackage",
    "@tsci/a.b.c",
    "@tsci/package-with-numbers123",
    "@tsci/package123-with-numbers",
    "@tsci/core.utils-helper",
    "@tsci/double--dash",
    "@tsci/seveibar.ABM8_272_T3",
  ]

  validPackages.forEach((pkg) => {
    test(`should match valid package: ${pkg}`, () => {
      const matches = Array.from(pkg.matchAll(TSCI_PACKAGE_PATTERN))
      expect(matches).toHaveLength(1)
      expect(matches[0][0]).toBe(pkg)
    })
  })

  // Test invalid patterns
  const invalidPackages = [
    "@tsci/", // Empty
    "@tsci/123start-with-number", // Starts with number
    "@tsci/-start-with-dash", // Starts with dash
    "@tsci/.start-with-dot", // Starts with dot

    "@tsci/double..dot", // Double dot
    "@tsci/end-with-dash-", // Ends with dash
    "@tsci/end-with-dot.", // Ends with dot
    "@tsci/invalid@chars", // Invalid characters
    "@tsci/dot.dash.-mixed", // Invalid dot-dash combination
    "@tsci/dash-.dot-mixed", // Invalid dash-dot combination
    "@tsci/space in name", // Contains space
    "@tsci/!", // Invalid character
    "@tsci/pkg#123", // Invalid character
    "@tsci/@invalid", // Invalid character
  ]

  invalidPackages.forEach((pkg) => {
    test(`should not match invalid package: ${pkg}`, () => {
      const matches = Array.from(pkg.matchAll(TSCI_PACKAGE_PATTERN))
      console.log(Array.from(pkg.matchAll(TSCI_PACKAGE_PATTERN)))
      expect(matches).toHaveLength(0)
    })
  })

  // Test import statements
  test("should match package names in import statements", () => {
    const importStatement =
      'import { something } from "@tsci/valid-package" import { other } from "@tsci/other-package.sub"'
    const matches = Array.from(importStatement.matchAll(TSCI_PACKAGE_PATTERN))
    expect(matches).toHaveLength(2)
    expect(matches.map((m) => m[0])).toEqual([
      "@tsci/valid-package",
      "@tsci/other-package.sub",
    ])
  })
})
