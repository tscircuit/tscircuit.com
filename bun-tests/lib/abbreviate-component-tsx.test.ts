import { expect, test } from "bun:test"
import { abbreviateComponentTsx } from "@/lib/abbreviate-component-tsx"

test("abbreviates display data while keeping permanent groups visible", () => {
  const source = `const labels = {pin1:["VIN"]} as const
export default () => <chip pinLabels={labels}
  pinAttributes={{pin1:{requiresVoltage:"3.3V"}}}
  supplierPartNumbers={{jlcpcb:["C123"]}}
  internallyConnectedPins={[["A","B"],["C","D"]]} />`
  const display = abbreviateComponentTsx(source)
  expect(display).toContain("const labels = ...")
  expect(display).toContain("pinLabels={...}")
  expect(display).toContain("pinAttributes={...}")
  expect(display).toContain("supplierPartNumbers={...}")
  expect(display).toContain('internallyConnectedPins={[["A","B"],["C","D"]]}')
  expect(display).not.toContain("3.3V")
})
