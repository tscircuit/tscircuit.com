import { expect, test } from "bun:test"
import { derivePackageParameters } from "@/lib/package-props-schema"

const unrelatedSchema = () => ({
  type: "object",
  properties: {
    enableTelemetry: { type: "boolean", default: false },
    gain: { type: "integer", minimum: -2, maximum: 2, default: 0 },
    clockRate: { type: "string", enum: ["8MHz", "16MHz"], default: "8MHz" },
    mode: { type: "string", enum: ["eco", "turbo"], default: "eco" },
    revision: { const: "A" },
  },
})
test("schema alone creates controls and defaults for unrelated property names", () => {
  const result = derivePackageParameters(unrelatedSchema())
  expect(result.parameters.map((p) => [p.id, p.type])).toEqual([
    ["enableTelemetry", "boolean"],
    ["gain", "number"],
    ["clockRate", "number"],
    ["mode", "enum"],
  ])
  expect(result.defaults).toEqual({
    enableTelemetry: false,
    gain: 0,
    clockRate: "8MHz",
    mode: "eco",
    revision: "A",
  })
  expect(result.domains).toEqual({
    enableTelemetry: [false, true],
    gain: [-2, -1, 0, 1, 2],
    clockRate: ["8MHz", "16MHz"],
    mode: ["eco", "turbo"],
    revision: ["A"],
  })
  expect(result.parameters[2]).toMatchObject({
    unit: "MHz",
    options: [
      { value: "8MHz", number: 8 },
      { value: "16MHz", number: 16 },
    ],
  })
  const schema = unrelatedSchema()
  Object.assign(schema.properties, {
    ledCurrent: {
      type: "number",
      enum: [0.005, 0.01],
      default: 0.005,
      "x-unit": "A",
    },
  })
  const changed = derivePackageParameters(schema)
  expect(changed.domains.ledCurrent).toEqual([0.005, 0.01])
  expect(changed.parameters.at(-1)).toMatchObject({
    id: "ledCurrent",
    type: "number",
    unit: "mA",
    options: [
      { value: 0.005, number: 5 },
      { value: 0.01, number: 10 },
    ],
  })
})
test("local references, fractional steps and quantity strings preserve their original prop values", () => {
  const result = derivePackageParameters({
    type: "object",
    $defs: {
      fraction: { type: "number", minimum: 0, maximum: 0.3, multipleOf: 0.1 },
    },
    properties: {
      voltage: { $ref: "#/$defs/fraction", default: 0.2, "x-unit": "V" },
      capacitor: { enum: ["22uF", "10uF"], default: "10uF" },
      resistor: { enum: ["100k", "10k"], default: "100k", "x-unit": "Ohm" },
    },
  })
  expect(result.domains.voltage).toEqual([0, 0.1, 0.2, 0.3])
  expect(result.parameters[1]).toMatchObject({
    unit: "µF",
    options: [
      { value: "10uF", number: 10 },
      { value: "22uF", number: 22 },
    ],
  })
  expect(result.parameters[2]).toMatchObject({
    unit: "kΩ",
    options: [
      { value: "10k", number: 10 },
      { value: "100k", number: 100 },
    ],
  })
})
test("rejects incomplete, contradictory, recursive and unbounded domains instead of guessing", () => {
  for (const property of [
    { type: "number", default: 1 },
    { type: "boolean" },
    { type: "boolean", default: null },
    { type: "number", enum: [1, "two"], default: 1 },
    { type: "number", enum: [1, 2], minimum: 2, default: 2 },
    { enum: [1, 1], default: 1 },
    { type: "object", default: {} },
    { $ref: "https://example.com/schema" },
    { $ref: "#/properties/x" },
    { type: "integer", minimum: 0, maximum: 200, default: 0 },
    { type: "boolean", default: true, if: {} },
  ])
    expect(() =>
      derivePackageParameters({ type: "object", properties: { x: property } }),
    ).toThrow()
  expect(() =>
    derivePackageParameters({ ...unrelatedSchema(), allOf: [] }),
  ).toThrow(/Conditional/)
})
