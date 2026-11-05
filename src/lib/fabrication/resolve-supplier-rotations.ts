import { analyzePcbPin1Location } from "@tscircuit/circuit-json-util"
import {
  type AnyCircuitElement,
  type PcbComponent,
  type SupplierName,
  getRotationBetweenPcbPin1Locations,
} from "circuit-json"
import type { PlacementComponent } from "./get-placement-components"
import type { PartOrientationOptions } from "circuit-json-to-pnp-csv"

type Point = { x: number; y: number }
type Pad = Extract<
  AnyCircuitElement,
  { type: "pcb_smtpad" | "pcb_plated_hole" }
>

export interface SupplierRotationOptions extends PartOrientationOptions {
  supplier: SupplierName
  flip_y_axis?: boolean
}

const normalize = (angle: number) => ((angle % 360) + 360) % 360
const numericHint = (hint: string) => /^(?:pin)?\d+$/i.test(hint)
const normalizeHint = (hint: string) =>
  hint
    .trim()
    .toLowerCase()
    .replace(/^pin(?=\d+$)/, "")
const getCenter = (pad: Pad): Point => {
  if (pad.type === "pcb_smtpad" && pad.shape === "polygon") {
    const xs = pad.points.map((p) => p.x)
    const ys = pad.points.map((p) => p.y)
    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    }
  }
  return { x: pad.x, y: pad.y }
}

const getPads = (json: AnyCircuitElement[], componentId: string) =>
  json.filter(
    (e): e is Pad =>
      (e.type === "pcb_smtpad" || e.type === "pcb_plated_hole") &&
      e.pcb_component_id === componentId,
  )

const getLocalPads = (
  json: AnyCircuitElement[],
  component: PcbComponent,
): Pad[] => {
  const angle = (-component.rotation * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const local = (p: Point): Point => {
    const x = p.x - component.center.x
    const y = p.y - component.center.y
    return { x: x * cos - y * sin, y: x * sin + y * cos }
  }
  return getPads(json, component.pcb_component_id).map(
    (pad): Pad =>
      pad.type === "pcb_smtpad" && pad.shape === "polygon"
        ? { ...pad, points: pad.points.map(local) }
        : { ...pad, ...local(getCenter(pad)) },
  )
}

// Source-port aliases survive imports that renumber electrical pads (e.g. USB-C
// A1B12/GND1). Only unique aliases can establish a pad correspondence.
const getLabeledPads = (
  json: AnyCircuitElement[],
  component: PcbComponent,
  pads: Pad[],
) => {
  const ports = json.filter(
    (e): e is Extract<AnyCircuitElement, { type: "source_port" }> =>
      e.type === "source_port" &&
      e.source_component_id === component.source_component_id,
  )
  const pcbPorts = new Map(
    json.flatMap((e) =>
      e.type === "pcb_port" ? [[e.pcb_port_id, e] as const] : [],
    ),
  )
  return pads.map((pad) => {
    const hints = (pad.port_hints ?? []).map(normalizeHint)
    const sourceId = pad.pcb_port_id
      ? pcbPorts.get(pad.pcb_port_id)?.source_port_id
      : undefined
    const port =
      ports.find((p) => p.source_port_id === sourceId) ??
      ports.find((p) =>
        [p.name, String(p.pin_number), ...(p.port_hints ?? [])].some((hint) =>
          hints.includes(normalizeHint(hint)),
        ),
      )
    return {
      center: getCenter(pad),
      hints: new Set([
        ...hints,
        ...(port
          ? [port.name, ...(port.port_hints ?? [])].map(normalizeHint)
          : []),
      ]),
    }
  })
}

const getMatchedPadRotation = (
  localJson: AnyCircuitElement[],
  component: PcbComponent,
  localPads: Pad[],
  supplierJson: AnyCircuitElement[],
  supplierComponent: PcbComponent,
  supplierPads: Pad[],
): number | null => {
  const local = getLabeledPads(localJson, component, localPads)
  const supplier = getLabeledPads(supplierJson, supplierComponent, supplierPads)
  const unique = (pads: typeof local, semantic: boolean) => {
    const map = new Map<string, number[]>()
    pads.forEach((pad, index) =>
      pad.hints.forEach((hint) => {
        if (!hint || numericHint(hint) === semantic) return
        map.set(hint, [...(map.get(hint) ?? []), index])
      }),
    )
    return new Map(
      [...map]
        .filter(([, indices]) => indices.length === 1)
        .map(([hint, indices]) => [hint, indices[0]!]),
    )
  }
  for (const semantic of [true, false]) {
    const a = unique(local, semantic)
    const b = unique(supplier, semantic)
    const pairs = new Map<number, number>()
    let conflict = false
    for (const [hint, i] of a) {
      const j = b.get(hint)
      if (j === undefined) continue
      if (
        (pairs.has(i) && pairs.get(i) !== j) ||
        [...pairs].some(([other, value]) => other !== i && value === j)
      )
        conflict = true
      pairs.set(i, j)
    }
    if (conflict) return null
    if (pairs.size < 2) continue
    const matches = [...pairs].map(([i, j]) => ({
      local: local[i]!.center,
      supplier: supplier[j]!.center,
    }))
    const centroid = (side: "local" | "supplier"): Point => ({
      x: matches.reduce((sum, m) => sum + m[side].x, 0) / matches.length,
      y: matches.reduce((sum, m) => sum + m[side].y, 0) / matches.length,
    })
    const localCenter = centroid("local")
    const supplierCenter = centroid("supplier")
    // Imported CAD rounds coordinates. Ten micrometres permits that rounding
    // while rejecting reflections, wrong pin maps and different pad pitches.
    const tolerance = 0.01
    if (
      !matches.some(
        (m) =>
          Math.hypot(m.local.x - localCenter.x, m.local.y - localCenter.y) >
          tolerance * 2,
      )
    )
      continue
    const candidates = [0, 90, 180, 270].filter((degrees) => {
      const radians = (degrees * Math.PI) / 180
      return matches.every((m) => {
        const x = m.supplier.x - supplierCenter.x
        const y = m.supplier.y - supplierCenter.y
        return (
          Math.hypot(
            x * Math.cos(radians) -
              y * Math.sin(radians) -
              (m.local.x - localCenter.x),
            x * Math.sin(radians) +
              y * Math.cos(radians) -
              (m.local.y - localCenter.y),
          ) <= tolerance
        )
      })
    })
    if (candidates.length === 1) return candidates[0]!
    // Semantic aliases are stronger than numeric import indices. A conflicting
    // semantic correspondence must not be replaced by a convenient numeric fit.
    if (semantic) return null
  }
  return null
}

export const resolveSupplierRotations = async (
  json: AnyCircuitElement[],
  entries: PlacementComponent[],
  options: SupplierRotationOptions,
): Promise<Map<string, number>> => {
  const { supplier } = options
  if (!supplier)
    throw new Error("Supplier rotation preparation requires a supplier")
  const cache = new Map<string, Promise<AnyCircuitElement[] | undefined>>()
  const results = new Map<string, number>()
  const errors: (string | undefined)[] = new Array(entries.length)
  let next = 0
  const worker = async () => {
    while (next < entries.length) {
      const index = next++
      const { component, source, designator } = entries[index]!
      try {
        const existingLocal = component.pin1_location
        const existingSupplier =
          component.supplier_pin1_location_map?.[supplier]
        if (existingLocal && existingSupplier) {
          const adjustment = getRotationBetweenPcbPin1Locations(
            existingSupplier,
            existingLocal,
          )
          if (adjustment !== null) {
            results.set(
              component.pcb_component_id,
              normalize(component.rotation + adjustment),
            )
            continue
          }
        }
        if (component.layer !== "top")
          throw new Error(
            "bottom-side JSON requires verified authored and supplier orientation metadata",
          )
        const partNumber = source.supplier_part_numbers?.[supplier]?.[0]
        if (!partNumber) throw new Error(`missing ${supplier} part number`)
        if (
          options.partsEngineDisabled ||
          !options.partsEngine?.fetchPartCircuitJson
        )
          throw new Error(
            "supplier orientation is missing and the parts engine is disabled or unavailable",
          )
        const key = `${supplier}:${partNumber}`
        if (!cache.has(key))
          cache.set(
            key,
            Promise.resolve().then(() =>
              options.partsEngine!.fetchPartCircuitJson!({
                supplierPartNumber: partNumber,
                platformFetch: options.platformFetch,
              }),
            ),
          )
        const supplierJson = await cache.get(key)
        if (!supplierJson?.length)
          throw new Error(`no supplier footprint for ${partNumber}`)
        const supplierComponents = supplierJson.filter(
          (e): e is PcbComponent => e.type === "pcb_component",
        )
        if (supplierComponents.length !== 1)
          throw new Error(`expected one supplier footprint for ${partNumber}`)
        const supplierComponent = supplierComponents[0]!
        if (supplierComponent.layer !== "top")
          throw new Error(
            `supplier footprint must use its top-side frame for ${partNumber}`,
          )
        const localPads = getLocalPads(json, component)
        const supplierPads = getLocalPads(supplierJson, supplierComponent)
        const localLocation = analyzePcbPin1Location(localPads) ?? existingLocal
        const supplierLocation =
          analyzePcbPin1Location(supplierPads) ?? existingSupplier
        let adjustment: number | null =
          localLocation && supplierLocation
            ? getRotationBetweenPcbPin1Locations(
                supplierLocation,
                localLocation,
              )
            : null
        if (adjustment === null)
          adjustment = getMatchedPadRotation(
            json,
            component,
            localPads,
            supplierJson,
            supplierComponent,
            supplierPads,
          )
        if (adjustment === null)
          throw new Error(
            `cannot match authored and supplier pad orientation for ${partNumber}`,
          )
        results.set(
          component.pcb_component_id,
          normalize(component.rotation + adjustment),
        )
      } catch (error) {
        errors[index] =
          `${designator}: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, worker))
  if (errors.some(Boolean))
    throw new Error(
      `Unverified supplier pick-and-place rotations:\n${errors.filter(Boolean).join("\n")}`,
    )
  return results
}
