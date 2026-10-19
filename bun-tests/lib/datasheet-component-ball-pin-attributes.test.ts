import { expect, test } from "bun:test"
import { getDatasheetComponentTsx } from "@/lib/datasheet-component-tsx"
import type { DatasheetWithPinAttributes } from "@/lib/datasheet-pin-display"

test("component TSX matches named physical pin attributes to footprint aliases", () => {
  const source = getDatasheetComponentTsx({
    chip_name: "AM62L32",
    footprinter_string: "bga373",
    pin_information: [
      { pin_number: "A1", name: ["VSS"], description: "", capabilities: [] },
      { pin_number: "2", name: ["VDD"], description: "", capabilities: [] },
    ],
    pin_attributes: {
      pinA1: { requiresGround: true },
      pin2: { requiresPower: true },
    },
  } as DatasheetWithPinAttributes)

  expect(source).toContain('"A1":{"requiresGround":true}')
  expect(source).toContain('"pin2":{"requiresPower":true}')
  expect(source).not.toContain('"pinA1":')
})
