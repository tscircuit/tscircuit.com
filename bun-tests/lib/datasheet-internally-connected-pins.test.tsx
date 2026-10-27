import { expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { DatasheetPinTable } from "@/components/DatasheetPinTable"
import { getInternallyConnectedPinNumbers } from "@/lib/datasheet-pin-display"

const pins = ["A", "B", "C", "D"].map((pin_number) => ({
  pin_number,
  name: [pin_number],
  description: "Switch contact",
  capabilities: [],
}))
const groups = [
  ["A", "B"],
  ["C", "D"],
]

test("push button rows show only permanently connected contacts", () => {
  const html = renderToStaticMarkup(
    <DatasheetPinTable
      pins={pins}
      pinAttributes={null}
      internallyConnectedPins={groups}
    />,
  )
  expect(html.match(/Internally connected to:/g)).toHaveLength(4)
  expect(html).toContain("Internally connected to: B")
  expect(getInternallyConnectedPinNumbers(pins[0], pins, groups)).toEqual(["B"])
  expect(getInternallyConnectedPinNumbers(pins[2], pins, groups)).toEqual(["D"])
  expect(getInternallyConnectedPinNumbers(pins[0], pins, null)).toEqual([])
})

test("groups resolve numeric identifiers, physical pin names and unique labels transitively", () => {
  const numbered = ["1", "2", "3"].map((pin_number) => ({
    ...pins[0],
    pin_number,
    name: [`SIGNAL${pin_number}`],
  }))
  expect(
    getInternallyConnectedPinNumbers(numbered[0], numbered, [
      [1, "pin2"],
      ["SIGNAL2", 3],
    ]),
  ).toEqual(["2", "3"])
})
