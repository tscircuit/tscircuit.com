import type {
  ChipProps,
  PinAttributeMap,
  SchematicPinArrangement,
  SupplierPartNumbers,
} from "@tscircuit/props"
import type { Datasheet } from "fake-snippets-api/lib/db/schema"

export type DatasheetPin = Omit<
  NonNullable<Datasheet["pin_information"]>[number],
  "name"
> & { name: string | string[] }

export type DatasheetWithPinAttributes = Omit<Datasheet, "pin_information"> & {
  pin_information: DatasheetPin[] | null
  internally_connected_pins?: ChipProps["internallyConnectedPins"] | null
  pin_attributes?: Record<string, PinAttributeMap> | null
  footprinter_string?: string | null
  generated_tsx?: string | null
  sch_pin_arrangement?: SchematicPinArrangement | null
  symbol_tsx?: string | null
  builtin_symbol_name?: string | null
  supplier_part_numbers?: SupplierPartNumbers | null
}

export const getPinNames = (pin: DatasheetPin) =>
  [...new Set(Array.isArray(pin.name) ? pin.name : [pin.name])].filter(Boolean)

export const getPinAttributes = (
  pin: DatasheetPin,
  attributes: DatasheetWithPinAttributes["pin_attributes"],
) => attributes?.[`pin${pin.pin_number}`] ?? attributes?.[pin.pin_number]

const capabilityLabels: Record<string, string> = {
  i2c_sda: "I²C SDA",
  i2c_scl: "I²C SCL",
  spi_cs: "SPI CS",
  spi_sck: "SPI clock",
  spi_mosi: "SPI MOSI",
  spi_miso: "SPI MISO",
  uart_tx: "UART TX",
  uart_rx: "UART RX",
}

export const formatCapability = (capability: string) =>
  capabilityLabels[capability] ?? capability.replaceAll("_", " ")

const voltage = (value: string | number) =>
  typeof value === "number" ? `${value} V` : value

// Only summarize explicit attributes. Do not guess electrical requirements from
// signal names or the prose, which can describe mutually exclusive mux modes.
export const getElectricalSummary = (attributes?: PinAttributeMap) => {
  if (!attributes) return []
  const labels: string[] = []
  if (attributes.doNotConnect) labels.push("Do not connect")
  if (attributes.requiresGround || attributes.providesGround)
    labels.push("Ground")
  if (attributes.requiresPower) labels.push("Supply input")
  if (attributes.providesPower) labels.push("Power output")
  if (attributes.isGpio) labels.push("GPIO")
  if (
    !attributes.isGpio &&
    !attributes.requiresPower &&
    !attributes.providesPower &&
    !attributes.requiresGround &&
    !attributes.providesGround &&
    !attributes.doNotConnect
  ) {
    if (
      attributes.isBidirectional ||
      (attributes.isInput && attributes.isOutput)
    )
      labels.push("Input / output")
    else if (attributes.isInput) labels.push("Input")
    else if (attributes.isOutput) labels.push("Output")
    else if (attributes.isPassive) labels.push("Passive")
  }
  if (attributes.requiresVoltage !== undefined && !attributes.requiresGround)
    labels.push(`Requires ${voltage(attributes.requiresVoltage)}`)
  if (attributes.providesVoltage !== undefined)
    labels.push(`Provides ${voltage(attributes.providesVoltage)}`)
  if (attributes.mustBeConnected) labels.push("Must connect")
  if (attributes.needsExternalPullup) labels.push("External pull-up")
  if (attributes.needsExternalPulldown) labels.push("External pull-down")
  if (attributes.shouldHaveDecouplingCapacitor)
    labels.push(
      attributes.recommendedDecouplingCapacitorCapacitance !== undefined
        ? `Decouple: ${attributes.recommendedDecouplingCapacitorCapacitance}`
        : "Decouple",
    )
  return labels
}

export const formatAttributeName = (name: string) =>
  name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace("Gpio", "GPIO")
    .replace("Tri State", "Tri-state")
    .replace("Pullup", "Pull-up")
    .replace("Pulldown", "Pull-down")
    .replace(/^./, (letter) => letter.toUpperCase())

export const formatAttributeValue = (value: unknown) => {
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value))
    return value.map(formatCapability).join(", ") || "None"
  return String(value)
}

/** Resolve physical identifiers before unique signal aliases; follow overlapping groups. */
export const getInternallyConnectedPinNumbers = (
  pin: DatasheetPin,
  pins: DatasheetPin[],
  groups: DatasheetWithPinAttributes["internally_connected_pins"],
): string[] => {
  const resolvePin = (identifier: string | number) => {
    const name = String(identifier)
    const physical = pins.find(
      (candidate) =>
        candidate.pin_number === name || `pin${candidate.pin_number}` === name,
    )
    if (physical) return physical.pin_number
    const matches = pins.filter((candidate) =>
      getPinNames(candidate).includes(name),
    )
    return matches.length === 1 ? matches[0].pin_number : undefined
  }
  const connected = new Set([pin.pin_number])
  const resolvedGroups = (groups ?? []).map((group) =>
    group.map(resolvePin).filter((name): name is string => name !== undefined),
  )
  let changed = true
  while (changed) {
    changed = false
    for (const group of resolvedGroups) {
      if (!group.some((name) => connected.has(name))) continue
      for (const name of group) {
        if (!connected.has(name)) {
          connected.add(name)
          changed = true
        }
      }
    }
  }
  return pins
    .filter(
      (candidate) =>
        candidate.pin_number !== pin.pin_number &&
        connected.has(candidate.pin_number),
    )
    .map((candidate) => candidate.pin_number)
}
