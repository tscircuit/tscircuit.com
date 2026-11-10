/** The package's published JSON Schema is the only source of parameter domains. */
export type ParameterValue = boolean | number | string
export type PackagePropsSchema = {
  $ref?: string
  type?: string | readonly string[]
  properties?: Record<string, PackagePropsSchema>
  enum?: readonly unknown[]
  const?: unknown
  default?: unknown
  title?: string
  minimum?: number
  maximum?: number
  exclusiveMinimum?: number
  exclusiveMaximum?: number
  multipleOf?: number
  readOnly?: boolean
  anyOf?: readonly PackagePropsSchema[]
  oneOf?: readonly PackagePropsSchema[]
  [key: string]: unknown
}
type Base = { id: string; label: string; default: ParameterValue }
export type SchemaParameter =
  | (Base & { type: "boolean"; default: boolean })
  | (Base & {
      type: "number"
      unit: string
      options: { value: ParameterValue; number: number }[]
    })
  | (Base & {
      type: "enum"
      options: { value: ParameterValue; label: string }[]
    })

const scalar = (value: unknown): value is ParameterValue =>
  typeof value === "boolean" ||
  typeof value === "string" ||
  (typeof value === "number" && Number.isFinite(value))
const own = (value: object, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key)
const fail = (id: string, message: string): never => {
  throw new Error(`Parameter ${id}: ${message}`)
}
const resolveSchema = ({
  rootSchema,
  schema,
  seen = new Set<string>(),
}: {
  rootSchema: PackagePropsSchema
  schema: PackagePropsSchema
  seen?: Set<string>
}): PackagePropsSchema => {
  if (!schema || typeof schema !== "object" || Array.isArray(schema))
    throw new Error("Invalid package props schema")
  if (!schema.$ref) return schema
  const ref = schema.$ref
  if (!ref.startsWith("#/") || seen.has(ref))
    throw new Error("Only nonrecursive local schema references are supported")
  seen.add(ref)
  let target: unknown = rootSchema
  for (const part of ref.slice(2).split("/")) {
    const key = part.replace(/~1/g, "/").replace(/~0/g, "~")
    if (
      !target ||
      typeof target !== "object" ||
      Array.isArray(target) ||
      !own(target, key)
    )
      throw new Error(`Missing schema reference ${ref}`)
    target = (target as Record<string, unknown>)[key]
  }
  const { $ref: _, ...annotations } = schema
  return {
    ...resolveSchema({
      rootSchema,
      schema: target as PackagePropsSchema,
      seen,
    }),
    ...annotations,
  }
}

function getSupportedPropChoices({
  rootSchema,
  propertySchema,
  propertyName,
}: {
  rootSchema: PackagePropsSchema
  propertySchema: PackagePropsSchema
  propertyName: string
}): ParameterValue[] {
  const field = resolveSchema({ rootSchema, schema: propertySchema })
  if (
    ["allOf", "if", "then", "else", "not", "dependentSchemas"].some((key) =>
      own(field, key),
    )
  )
    return fail(
      propertyName,
      "conditional domains are not supported by prebuilt previews",
    )
  let values: unknown[]
  if (own(field, "const")) values = [field.const]
  else if (field.readOnly && own(field, "default")) values = [field.default]
  else if (field.enum) values = [...field.enum]
  else if (field.anyOf || field.oneOf)
    values = (field.anyOf ?? field.oneOf)!.flatMap((option) =>
      getSupportedPropChoices({
        rootSchema,
        propertySchema: option,
        propertyName,
      }),
    )
  else if (field.type === "boolean") values = [false, true]
  else if (field.type === "number" || field.type === "integer") {
    const minimum = field.minimum ?? field.exclusiveMinimum
    const maximum = field.maximum ?? field.exclusiveMaximum
    const step = field.multipleOf ?? (field.type === "integer" ? 1 : undefined)
    if (
      !Number.isFinite(minimum) ||
      !Number.isFinite(maximum) ||
      !step ||
      !Number.isFinite(step) ||
      step <= 0
    )
      return fail(
        propertyName,
        "declare enum values, or finite bounds and multipleOf (step)",
      )
    const epsilon = Math.abs(step) * 1e-9
    const start = Math.ceil((minimum! - epsilon) / step) * step
    const count = Math.floor((maximum! - start + epsilon) / step) + 1
    if (count < 1 || count > 128)
      return fail(propertyName, "the supported range must contain 1–128 steps")
    values = Array.from({ length: count }, (_, index) =>
      Number((start + index * step).toPrecision(14)),
    ).filter(
      (value) =>
        (field.type !== "integer" || Number.isInteger(value)) &&
        (field.exclusiveMinimum === undefined ||
          value > field.exclusiveMinimum + epsilon) &&
        (field.exclusiveMaximum === undefined ||
          value < field.exclusiveMaximum - epsilon),
    )
  } else
    return fail(
      propertyName,
      "declare a finite boolean, enum, or bounded numeric domain",
    )
  if (!values.length || values.length > 128 || !values.every(scalar))
    return fail(propertyName, "supported choices must be finite scalar values")
  for (const value of values) {
    const types = Array.isArray(field.type)
      ? field.type
      : field.type
        ? [field.type]
        : []
    if (
      types.length &&
      !types.some(
        (type) =>
          type === typeof value ||
          (type === "integer" &&
            typeof value === "number" &&
            Number.isInteger(value)),
      )
    )
      return fail(propertyName, "a choice does not match the declared type")
    if (
      typeof value === "number" &&
      ((field.minimum !== undefined && value < field.minimum) ||
        (field.maximum !== undefined && value > field.maximum) ||
        (field.exclusiveMinimum !== undefined &&
          value <= field.exclusiveMinimum) ||
        (field.exclusiveMaximum !== undefined &&
          value >= field.exclusiveMaximum) ||
        (field.multipleOf !== undefined &&
          Math.abs(
            value / field.multipleOf - Math.round(value / field.multipleOf),
          ) > 1e-8))
    )
      return fail(propertyName, "a choice violates the numeric bounds")
  }
  const unique = [...new Set(values as ParameterValue[])]
  if (unique.length !== values.length)
    return fail(propertyName, "duplicate choices")
  return unique
}

const prefixes: Record<string, number> = {
  y: 1e-24,
  z: 1e-21,
  a: 1e-18,
  f: 1e-15,
  p: 1e-12,
  n: 1e-9,
  u: 1e-6,
  µ: 1e-6,
  μ: 1e-6,
  m: 1e-3,
  "": 1,
  k: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
  P: 1e15,
  E: 1e18,
  Z: 1e21,
  Y: 1e24,
}
const engineering: Record<number, string> = {
  [-24]: "y",
  [-21]: "z",
  [-18]: "a",
  [-15]: "f",
  [-12]: "p",
  [-9]: "n",
  [-6]: "µ",
  [-3]: "m",
  0: "",
  3: "k",
  6: "M",
  9: "G",
  12: "T",
  15: "P",
  18: "E",
  21: "Z",
  24: "Y",
}
const normalizeUnit = (unit: string) => (/^ohms?$/i.test(unit) ? "Ω" : unit)
function quantity(value: ParameterValue, hint: string) {
  if (typeof value === "number") return { number: value, unit: hint }
  if (typeof value !== "string") return undefined
  const match = value
    .trim()
    .match(
      /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*([yzafpnuµμmkMGTPEZY]?)([A-Za-zΩ%°]*)$/,
    )
  if (!match) return undefined
  const unit = normalizeUnit(match[3] || hint)
  if (hint && unit !== hint) return undefined
  const number = Number(match[1]) * prefixes[match[2]]
  return Number.isFinite(number) ? { number, unit } : undefined
}
const humanize = (id: string) => {
  const words = id.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase()
}

export function derivePackageParameters(schema: PackagePropsSchema) {
  const root = resolveSchema({ rootSchema: schema, schema })
  if (root.type !== "object" || !root.properties)
    throw new Error("Package props schema must describe an object")
  if (
    [
      "allOf",
      "anyOf",
      "oneOf",
      "if",
      "then",
      "else",
      "not",
      "dependentSchemas",
      "dependencies",
    ].some((key) => own(root, key))
  )
    throw new Error(
      "Conditional object schemas are not supported by prebuilt previews",
    )
  const entries = Object.entries(root.properties)
  if (entries.length > 16)
    throw new Error("Package preview supports up to 16 properties")
  const defaults: Record<string, ParameterValue> = {}
  const domains: Record<string, ParameterValue[]> = {}
  const parameters: SchemaParameter[] = []
  for (const [id, input] of entries) {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(id))
      return fail(id, "unsupported property name")
    const field = resolveSchema({ rootSchema: schema, schema: input })
    const values = getSupportedPropChoices({
      rootSchema: schema,
      propertySchema: field,
      propertyName: id,
    })
    const rootDefault = root.default as Record<string, unknown> | undefined
    const defaultValue = own(field, "default")
      ? field.default
      : rootDefault && own(rootDefault, id)
        ? rootDefault[id]
        : values.length === 1
          ? values[0]
          : undefined
    if (!scalar(defaultValue) || !values.includes(defaultValue))
      return fail(id, "a valid schema default is required")
    defaults[id] = defaultValue
    domains[id] = values
    if (values.length < 2 || field.readOnly) continue
    const label = field.title?.trim() || humanize(id)
    if (label.length > 120) return fail(id, "title is too long")
    if (values.every((value) => typeof value === "boolean")) {
      parameters.push({
        id,
        label,
        default: defaultValue as boolean,
        type: "boolean",
      })
      continue
    }
    const unitHint =
      typeof field["x-unit"] === "string" ? normalizeUnit(field["x-unit"]) : ""
    const quantities = values.map((value) => quantity(value, unitHint))
    if (
      quantities.every(Boolean) &&
      new Set(quantities.map((value) => value!.unit)).size === 1
    ) {
      const unit = quantities[0]!.unit
      const largest = Math.max(
        ...quantities.map((value) => Math.abs(value!.number)),
      )
      const exponent =
        unit && largest
          ? Math.max(-24, Math.min(24, Math.floor(Math.log10(largest) / 3) * 3))
          : 0
      const scale = 10 ** exponent
      const options = values
        .map((value, index) => ({
          value,
          number: Number((quantities[index]!.number / scale).toPrecision(12)),
        }))
        .sort((a, b) => a.number - b.number)
      if (
        new Set(options.map((option) => option.number)).size !== options.length
      )
        return fail(id, "quantity choices must have distinct numeric values")
      parameters.push({
        id,
        label,
        default: defaultValue,
        type: "number",
        unit: `${engineering[exponent]}${unit}`,
        options,
      })
    } else {
      parameters.push({
        id,
        label,
        default: defaultValue,
        type: "enum",
        options: values.map((value) => ({ value, label: String(value) })),
      })
    }
  }
  return { parameters, defaults, domains }
}
