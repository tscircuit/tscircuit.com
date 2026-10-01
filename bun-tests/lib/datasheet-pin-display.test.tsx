import { describe, expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { DatasheetPinTable } from "@/components/DatasheetPinTable"
import {
  type DatasheetPin,
  getElectricalSummary,
  getPinAttributes,
  getPinNames,
  formatAttributeValue,
} from "@/lib/datasheet-pin-display"

const pin: DatasheetPin = {
  pin_number: "2",
  name: ["PA2", "OSC_IN", "USART1_TX", "SPI1_MISO"],
  description: "Full manufacturer pin notes with conditional mux requirements.",
  capabilities: ["uart_tx", "spi_miso"],
}

describe("datasheet pin display", () => {
  test("supports manufacturer alias arrays and legacy string names", () => {
    expect(getPinNames(pin)).toEqual([
      "PA2",
      "OSC_IN",
      "USART1_TX",
      "SPI1_MISO",
    ])
    expect(getPinNames({ ...pin, name: "PA2" })).toEqual(["PA2"])
    expect(getPinNames({ ...pin, name: ["PA2", "PA2", ""] })).toEqual(["PA2"])
  })

  test("uses physical pin attributes for numbered contacts and BGA balls", () => {
    const power = { requiresPower: true }
    const ground = { requiresGround: true }
    expect(getPinAttributes(pin, { pin2: power })).toEqual(power)
    expect(getPinAttributes(pin, { "2": ground })).toEqual(ground)
    expect(
      getPinAttributes({ ...pin, pin_number: "A1" }, { A1: power }),
    ).toEqual(power)
    expect(getPinAttributes(pin, null)).toBeUndefined()
  })

  test("preserves zero voltage and explicit false without inferring supply levels", () => {
    expect(getElectricalSummary({ requiresVoltage: 0 })).toEqual([
      "Requires 0 V",
    ])
    expect(getElectricalSummary({ providesVoltage: 2.8 })).toEqual([
      "Provides 2.8 V",
    ])
    expect(
      getElectricalSummary({ requiresPower: true, mustBeConnected: true }),
    ).toEqual(["Supply input", "Must connect"])
    expect(getElectricalSummary()).toEqual([])
    expect(formatAttributeValue(false)).toBe("No")
  })

  test("separates selectable GPIO options from configured and mandatory modes", () => {
    expect(
      getElectricalSummary({
        isGpio: true,
        canUseOpenDrain: true,
        canUseInternalPullup: true,
      }),
    ).toEqual(["GPIO"])
    expect(getElectricalSummary({ needsExternalPullup: true })).toEqual([
      "External pull-up",
    ])
    expect(
      getElectricalSummary({
        shouldHaveDecouplingCapacitor: true,
        recommendedDecouplingCapacitorCapacitance: "100nF",
      }),
    ).toEqual(["Decouple: 100nF"])
  })

  test("keeps notes in initially hidden details and labels available serial functions", () => {
    const html = renderToStaticMarkup(
      <DatasheetPinTable
        pins={[pin]}
        pinAttributes={{
          pin2: { isGpio: true, isInput: true, isOutput: false },
        }}
      />,
    )
    expect(html).toContain("UART TX")
    expect(html).toContain("SPI MISO")
    expect(html).toContain('aria-expanded="false"')
    expect(html).toMatch(/<tr[^>]+hidden=""/)
    expect(html).toContain(pin.description)
    expect(html).toContain("Is Output")
    expect(html).toContain(">No</dd>")
    expect(html).not.toContain("PA2OSC_IN")
  })

  test("legacy records retain notes and indicate missing structured attributes", () => {
    const html = renderToStaticMarkup(
      <DatasheetPinTable
        pins={[{ ...pin, name: "PA2", capabilities: [] }]}
        pinAttributes={null}
      />,
    )
    expect(html).toContain("PA2")
    expect(html).toContain("Not specified")
    expect(html).toContain("No structured pin attributes available.")
    expect(html).toContain(pin.description)
  })
})
