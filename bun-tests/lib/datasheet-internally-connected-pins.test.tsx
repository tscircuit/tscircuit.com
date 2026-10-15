import { expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { DatasheetPinTable } from "@/components/DatasheetPinTable"
import { getDatasheetComponentTsx } from "@/lib/datasheet-component-tsx"
import {
  getInternallyConnectedPinNumbers,
  type DatasheetWithPinAttributes,
} from "@/lib/datasheet-pin-display"

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

test("push button rows show only permanently connected contacts and TSX uses current groups", () => {
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
  const data = {
    pin_information: pins,
    internally_connected_pins: groups,
  } as unknown as DatasheetWithPinAttributes
  const tsx = getDatasheetComponentTsx(data)!
  expect(tsx).toContain('internallyConnectedPins={[["A","B"],["C","D"]]}')
  expect(
    getDatasheetComponentTsx({
      ...data,
      generated_tsx:
        "export default (props) => <chip internallyConnectedPins={[[1,2]]} {...props} />",
    }),
  ).not.toContain("[[1,2]]")
  expect(
    getDatasheetComponentTsx({
      ...data,
      internally_connected_pins: null,
      generated_tsx: tsx,
    }),
  ).toContain("internallyConnectedPins={[]}")
  expect(
    getDatasheetComponentTsx({
      ...data,
      internally_connected_pins: undefined,
      generated_tsx: tsx,
    }),
  ).toContain('[["A","B"],["C","D"]]')
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
