import { expect, test } from "bun:test"
import {
  getReferenceDesignUrl,
  getReferenceDesignsUrl,
} from "@/lib/reference-design-selection"

test("design pages have a datasheet index and an encoded package identity", () => {
  expect(getReferenceDesignsUrl("CHIP-123")).toBe(
    "/datasheets/CHIP-123/reference-designs",
  )
  expect(
    getReferenceDesignUrl({ chipName: "Chip 123", name: "maker/design name" }),
  ).toBe("/datasheets/Chip%20123/reference-designs/maker/design%20name")
})
