import { analyzePcbPin1Location } from "@tscircuit/circuit-json-util"
import type {
  EasyEdaProxyConfig,
  JlcPcbPartsEngine,
} from "@tscircuit/parts-engine"
import {
  type AnyCircuitElement,
  type PcbComponent,
  type PcbPin1Location,
  getRotationBetweenPcbPin1Locations,
} from "circuit-json"

export type FetchSupplierPartCircuitJson = (
  partNumber: string,
) => Promise<AnyCircuitElement[] | undefined>

export type FabricationPlatformOptions = {
  easyEdaProxyConfig?: EasyEdaProxyConfig
}

// Load the parts engine only when an exported part needs a supplier lookup.
export const createFabricationPartFetcher = (
  options: FabricationPlatformOptions = {},
): FetchSupplierPartCircuitJson => {
  let partsEnginePromise: Promise<JlcPcbPartsEngine> | undefined
  return async (supplierPartNumber) => {
    partsEnginePromise ??= import("@tscircuit/parts-engine").then(
      ({ JlcPcbPartsEngine }) => new JlcPcbPartsEngine(options),
    )
    const partsEngine = await partsEnginePromise
    return partsEngine.fetchPartCircuitJson({ supplierPartNumber })
  }
}

const getLocalPin1Location = (
  circuitJson: AnyCircuitElement[],
  pcbComponent: PcbComponent,
): PcbPin1Location | null => {
  const angle = (-pcbComponent.rotation * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  // Undo rotation first, then the local X mirror used for bottom-side pads.
  const toLocal = (point: { x: number; y: number }) => {
    const x = point.x - pcbComponent.center.x
    const y = point.y - pcbComponent.center.y
    const localX = x * cos - y * sin
    return {
      x: pcbComponent.layer === "bottom" ? -localX : localX,
      y: x * sin + y * cos,
    }
  }
  const pads = circuitJson
    .filter(
      (element) =>
        (element.type === "pcb_smtpad" || element.type === "pcb_plated_hole") &&
        element.pcb_component_id === pcbComponent.pcb_component_id,
    )
    .map((pad) => {
      if ("points" in pad && pad.points) {
        return { ...pad, points: pad.points.map(toLocal) }
      }
      if ("x" in pad && "y" in pad) return { ...pad, ...toLocal(pad) }
      return pad
    })
  return analyzePcbPin1Location(pads)
}

/** Enrich saved Circuit JSON for assembly, without changing any pad or trace. */
export const prepareJlcpcbPickAndPlace = async (
  circuitJson: AnyCircuitElement[],
  fetchSupplierPartCircuitJson: FetchSupplierPartCircuitJson,
) => {
  const warnings: string[] = []
  const supplierFrames = new Map<string, Promise<PcbPin1Location | null>>()
  const preparedCircuitJson = await Promise.all(
    circuitJson.map(async (pcbComponent): Promise<AnyCircuitElement> => {
      if (pcbComponent.type !== "pcb_component" || pcbComponent.do_not_place) {
        return pcbComponent
      }
      const source = circuitJson.find(
        (element) =>
          element.type === "source_component" &&
          element.source_component_id === pcbComponent.source_component_id,
      )
      if (
        !source ||
        source.type !== "source_component" ||
        source.ftype === "simple_test_point"
      ) {
        return pcbComponent
      }
      const name = source.name ?? pcbComponent.pcb_component_id
      const partNumber = source.supplier_part_numbers?.jlcpcb?.[0]
      const localFrame =
        getLocalPin1Location(circuitJson, pcbComponent) ??
        pcbComponent.pin1_location
      let supplierFrame = pcbComponent.supplier_pin1_location_map?.jlcpcb

      if (localFrame && !supplierFrame && partNumber) {
        try {
          if (!supplierFrames.has(partNumber)) {
            supplierFrames.set(
              partNumber,
              (async () => {
                const supplierCircuitJson =
                  await fetchSupplierPartCircuitJson(partNumber)
                if (!supplierCircuitJson?.length) {
                  throw new Error("Supplier footprint was not returned")
                }
                return analyzePcbPin1Location(supplierCircuitJson)
              })(),
            )
          }
          supplierFrame = (await supplierFrames.get(partNumber)) ?? undefined
        } catch (error) {
          throw new Error(
            `Cannot determine JLCPCB placement rotation for ${name} (${partNumber}): ${error instanceof Error ? error.message : String(error)}`,
          )
        }
      }

      if (!localFrame || !supplierFrame) {
        warnings.push(
          `${name}: JLCPCB orientation could not be analyzed. Verify this placement manually before assembly.`,
        )
        return pcbComponent
      }
      if (
        getRotationBetweenPcbPin1Locations(supplierFrame, localFrame) === null
      ) {
        throw new Error(
          `Cannot match the JLCPCB pin numbering for ${name} (${partNumber ?? "unknown part"}) by rotation. Check the footprint before assembly.`,
        )
      }
      return {
        ...pcbComponent,
        pin1_location: localFrame,
        supplier_pin1_location_map: {
          ...pcbComponent.supplier_pin1_location_map,
          jlcpcb: supplierFrame,
        },
      }
    }),
  )
  return { circuitJson: preparedCircuitJson, warnings }
}
