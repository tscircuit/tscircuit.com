import { expect, test } from "bun:test"
import {
  getReferenceDesignUrl,
  getReferenceDesignsUrl,
  readReferenceDesignSelection,
} from "@/lib/reference-design-selection"

test("design pages have a datasheet index and an encoded package identity", () => {
  expect(getReferenceDesignsUrl("CHIP-123")).toBe(
    "/datasheets/CHIP-123/reference-designs",
  )
  expect(
    getReferenceDesignUrl({ chipName: "Chip 123", name: "maker/design name" }),
  ).toBe("/datasheets/Chip%20123/reference-designs/maker/design%20name")
})

test("shared design links use ordinary package file/release parameters and view hashes", () => {
  const query = new URLSearchParams({
    package_release_id: "release-a",
    preview_file: "dist/states/test/circuit.json.gz",
    schematic_sheet: "power",
  })
  expect(readReferenceDesignSelection(`?${query}#pcb`)).toEqual({
    release: "release-a",
    file: "dist/states/test/circuit.json.gz",
    sheet: "power",
    view: "pcb",
  })
  expect(
    readReferenceDesignSelection("?package_release_id=release-b#3d"),
  ).toEqual({
    release: "release-b",
    file: undefined,
    sheet: undefined,
    view: "3d",
  })
  expect(readReferenceDesignSelection("#unknown").view).toBe("schematic")
  expect(readReferenceDesignSelection("").view).toBe("schematic")
})
