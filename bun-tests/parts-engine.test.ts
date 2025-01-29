import { jlcPartsEngine } from "@/lib/jlc-parts-engine"
import { test, expect, afterEach, beforeEach, describe, jest } from "bun:test"

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

describe("jlcPartsEngine", () => {
  describe("findPart for simple_pin_header", () => {
    // Mock fetch response
    const mockHeaders = [
      { lcsc: "123" },
      { lcsc: "456" },
      { lcsc: "789" },
      { lcsc: "012" }
    ]

    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ headers: mockHeaders })
        })
      ) as jest.Mock
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test("handles pin header with all properties specified", async () => {
      const result = await jlcPartsEngine.findPart({
        sourceComponent: {
          type: "source_component",
          ftype: "simple_pin_header",
          source_component_id: "J1",
          pin_count: 8,
          gender: "female",
          name: "J1"
        },
        footprinterString: "header_8_p2.54"
      })

      expect(result.jlcpcb).toEqual(["C123", "C456", "C789"])
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("pitch=2.54&num_pins=8&gender=female")
      )
    })

    test("extracts pin count from footprint when not specified", async () => {
      const result = await jlcPartsEngine.findPart({
        sourceComponent: {
          type: "source_component",
          source_component_id: "J2",
          ftype: "simple_pin_header",
          gender: "male",
          name: "J2",
          pin_count: 16
        },
        footprinterString: "header_16"
      })

      expect(result.jlcpcb).toEqual(["C123", "C456", "C789"])
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("num_pins=16")
      )
    })

    test("uses default male gender when not specified", async () => {
      const result = await jlcPartsEngine.findPart({
        sourceComponent: {
          type: "source_component",
          source_component_id: "J3",
          ftype: "simple_pin_header",
          pin_count: 4,
          name: "J3",
          gender: "male"
        },
        footprinterString: "header_4"
      })

      expect(result.jlcpcb).toEqual(["C123", "C456", "C789"])
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("gender=male")
      )
    })

    test("handles missing pin count and invalid footprint", async () => {
      const result = await jlcPartsEngine.findPart({
        sourceComponent: {
          type: "source_component",
          source_component_id: "J4",
          ftype: "simple_pin_header",
          pin_count: 4,
          name: "J4",
          gender: "male"
        },
        footprinterString: "invalid_header"
      })

      expect(result).toEqual({})
      expect(fetch).not.toHaveBeenCalled()
    })

    test("handles API errors gracefully", async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error("API Error")))

      const result = await jlcPartsEngine.findPart({
        sourceComponent: {
          type: "source_component",
          source_component_id: "J5",
          ftype: "simple_pin_header",
          pin_count: 8,
          gender: "male",
          name: "J5"
        },
        footprinterString: "header_8"
      })

      expect(result).toEqual({})
    })
  })
})