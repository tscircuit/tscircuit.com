import { expect, test } from "bun:test"
import ts from "typescript"
import {
  findPackageComponentExport,
  getPackageUsage,
} from "../src/lib/package-usage"

test("resolves bundled default exports and ignores schema exports", async () => {
  expect(
    await findPackageComponentExport(`
    declare function Ne555Timer(): any
    declare const propsSchema: unknown
    export { Ne555Timer as default, propsSchema }
  `),
  ).toEqual({ name: "Component", isDefault: true })
})

test("resolves aliased named components and ignores type-only exports", async () => {
  expect(
    await findPackageComponentExport(`
    declare function Timer(): any
    export type { TimerProps }
    export { Timer as Ne555Timer, type Schema, propsSchema }
  `),
  ).toEqual({ name: "Ne555Timer", isDefault: false })
  expect(
    await findPackageComponentExport("export declare function Timer(): any"),
  ).toEqual({ name: "Timer", isDefault: false })
})

test("does not guess among multiple components or type-only packages", async () => {
  expect(
    await findPackageComponentExport("export { Timer, OtherTimer }"),
  ).toBeNull()
  expect(
    await findPackageComponentExport("export interface TimerProps {}"),
  ).toBeNull()
})

test("serializes configured values as valid TSX without losing types or escaping", () => {
  const code = getPackageUsage({
    packageName: "ShiboSoftwareDev/ne555-timer-presets",
    component: { name: "Component", isDefault: true },
    values: {
      timingCapacitance: "100uF",
      omitLed: false,
      count: 0,
      label: 'a"{b}\n&<>',
    },
  })
  expect(code).toContain(
    'import Component from "@tsci/ShiboSoftwareDev.ne555-timer-presets"',
  )
  expect(code).toContain('timingCapacitance={"100uF"}')
  expect(code).toContain("omitLed={false}")
  expect(code).toContain("count={0}")
  const result = ts.transpileModule(code, {
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
  })
  expect(result.diagnostics).toEqual([])
  expect(result.outputText).toContain('label: "a\\"{b}\\n&<>"')
})

test("updates usage when values change and supports named component imports", () => {
  const options = {
    packageName: "author/timer",
    component: { name: "Timer", isDefault: false },
  }
  const defaults = getPackageUsage({ ...options, values: { omitLed: false } })
  const changed = getPackageUsage({ ...options, values: { omitLed: true } })
  expect(changed).toContain(
    'import { Timer as Component } from "@tsci/author.timer"',
  )
  expect(defaults).toContain("omitLed={false}")
  expect(changed).toContain("omitLed={true}")
})
