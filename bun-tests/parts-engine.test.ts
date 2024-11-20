import { jlcPartsEngine } from "@/lib/jlc-parts-engine"
import { test, expect } from "bun:test"

test("findPart", async () => {
  if (process.env.CI) return
  const supplierPartNumbers = await jlcPartsEngine.findPart({
    sourceComponent: {
      type: "source_component",
      ftype: "simple_resistor",
      source_component_id: "123",
      name: "R1",
      resistance: 1000,
    },
    footprinterString: "0402",
  })

  expect(supplierPartNumbers.jlcpcb!.length).toEqual(3)
})
