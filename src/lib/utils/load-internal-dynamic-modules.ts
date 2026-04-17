import importer from "@tscircuit/internal-dynamic-import"
import * as circuitJsonToGltf from "circuit-json-to-gltf"

type CircuitJsonToGerberModule = typeof import("circuit-json-to-gerber")
type CircuitJsonToGltfModule = typeof import("circuit-json-to-gltf")
type CircuitJsonToStepModule = typeof import("circuit-json-to-step")

let gerberModulePromise: Promise<CircuitJsonToGerberModule> | null = null
let gltfModulePromise: Promise<CircuitJsonToGltfModule> | null = null
let stepModulePromise: Promise<CircuitJsonToStepModule> | null = null

export const loadCircuitJsonToGerber =
  async (): Promise<CircuitJsonToGerberModule> => {
    gerberModulePromise ??= importer(
      "circuit-json-to-gerber",
    ) as Promise<CircuitJsonToGerberModule>
    return gerberModulePromise
  }

export const loadCircuitJsonToGltf =
  async (): Promise<CircuitJsonToGltfModule> => {
    gltfModulePromise ??= importer(
      "circuit-json-to-gltf",
    ) as Promise<CircuitJsonToGltfModule>
    return gltfModulePromise
  }

export const loadCircuitJsonToStep =
  async (): Promise<CircuitJsonToStepModule> => {
    globalThis.tscircuitDynamicModules ??= {}
    globalThis.tscircuitDynamicModules["circuit-json-to-gltf"] =
      circuitJsonToGltf

    stepModulePromise ??= importer(
      "circuit-json-to-step",
    ) as Promise<CircuitJsonToStepModule>
    return stepModulePromise
  }
