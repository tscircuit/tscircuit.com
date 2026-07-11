import importer from "@tscircuit/internal-dynamic-import"
import type { AnyCircuitElement, CircuitJson } from "circuit-json"

type CircuitJsonTo3dPngModule = {
  renderCircuitJsonTo3dPng: (
    circuitJson: AnyCircuitElement[],
    options?: any,
  ) => Promise<Uint8Array>
}

type CircuitJsonToBomCsvModule = {
  convertCircuitJsonToBomRows: (params: {
    circuitJson: AnyCircuitElement[]
  }) => Promise<any[]> | any[]
  convertBomRowsToCsv: (bomRows: any[]) => Promise<string> | string
}

type CircuitJsonToGerberModule = {
  convertSoupToGerberCommands: (
    circuitJson: AnyCircuitElement[],
    options?: any,
  ) => any
  stringifyGerberCommandLayers: (
    gerberLayerCommands: any,
  ) => Record<string, string>
  convertSoupToExcellonDrillCommands: (params: any) => any
  stringifyExcellonDrill: (drillCommands: any) => string
}

type CircuitJsonToGltfModule = {
  convertCircuitJsonToGltf: (
    circuitJson: CircuitJson,
    options?: { format?: "glb" | "gltf"; [key: string]: any },
  ) => Promise<any>
}

type KicadConverterClass = new (
  ...args: any[]
) => {
  runUntilFinished: () => void
  getOutputString: () => string
  getModel3dSourcePaths?: () => string[]
}

type CircuitJsonToKicadModule = {
  CircuitJsonToKicadPcbConverter: KicadConverterClass
  CircuitJsonToKicadSchConverter: KicadConverterClass
  CircuitJsonToKicadProConverter: KicadConverterClass
  resolveAndLoadKicad3dModelFiles?: (params: {
    projectName: string
    model3dSourcePaths: string[]
    fetch: typeof fetch
    onModelFile: (params: {
      outputPath: string
      content: string | Buffer
    }) => void
    onError: (params: { sourcePath: string; error?: unknown }) => void
  }) => Promise<void>
}

type CircuitJsonToLbrnModule = Record<string, unknown>

type CircuitJsonToPnpCsvModule = {
  convertCircuitJsonToPickAndPlaceCsv: (
    circuitJson: AnyCircuitElement[],
  ) => Promise<string> | string
}

type CircuitJsonToReadableNetlistModule = {
  convertCircuitJsonToReadableNetlist: (
    circuitJson: AnyCircuitElement[],
  ) => string
}

type CircuitJsonToSpiceModule = {
  circuitJsonToSpice: (circuitJson: AnyCircuitElement[]) => {
    toSpiceString: () => string
  }
}

type CircuitJsonToStepModule = {
  circuitJsonToStep: (
    circuitJson: AnyCircuitElement[],
    options?: any,
  ) => Promise<string> | string
}

type CircuitJsonToTscircuitModule = {
  convertCircuitJsonToTscircuit: (
    circuitJson: AnyCircuitElement[],
    options?: any,
  ) => string
}

const modulePromises = new Map<string, Promise<unknown>>()

const loadCircuitJsonConverter = <T>(packageName: string): Promise<T> => {
  const existingPromise = modulePromises.get(packageName)
  if (existingPromise) return existingPromise as Promise<T>

  const modulePromise = importer(packageName)
  modulePromises.set(packageName, modulePromise)
  return modulePromise as Promise<T>
}

const ensureCircuitJsonToGltfLoaded =
  async (): Promise<CircuitJsonToGltfModule> => {
    return loadCircuitJsonConverter<CircuitJsonToGltfModule>(
      "circuit-json-to-gltf",
    )
  }

export const loadCircuitJsonTo3dPng =
  async (): Promise<CircuitJsonTo3dPngModule> => {
    await ensureCircuitJsonToGltfLoaded()
    return loadCircuitJsonConverter<CircuitJsonTo3dPngModule>(
      "circuit-json-to-3d-png",
    )
  }

export const loadCircuitJsonToBomCsv =
  async (): Promise<CircuitJsonToBomCsvModule> => {
    return loadCircuitJsonConverter<CircuitJsonToBomCsvModule>(
      "circuit-json-to-bom-csv",
    )
  }

export const loadCircuitJsonToGerber =
  async (): Promise<CircuitJsonToGerberModule> => {
    return loadCircuitJsonConverter<CircuitJsonToGerberModule>(
      "circuit-json-to-gerber",
    )
  }

export const loadCircuitJsonToGltf =
  async (): Promise<CircuitJsonToGltfModule> => {
    return ensureCircuitJsonToGltfLoaded()
  }

export const loadCircuitJsonToKicad =
  async (): Promise<CircuitJsonToKicadModule> => {
    return loadCircuitJsonConverter<CircuitJsonToKicadModule>(
      "circuit-json-to-kicad",
    )
  }

export const loadCircuitJsonToLbrn =
  async (): Promise<CircuitJsonToLbrnModule> => {
    return loadCircuitJsonConverter<CircuitJsonToLbrnModule>(
      "circuit-json-to-lbrn",
    )
  }

export const loadCircuitJsonToPnpCsv =
  async (): Promise<CircuitJsonToPnpCsvModule> => {
    return loadCircuitJsonConverter<CircuitJsonToPnpCsvModule>(
      "circuit-json-to-pnp-csv",
    )
  }

export const loadCircuitJsonToReadableNetlist =
  async (): Promise<CircuitJsonToReadableNetlistModule> => {
    return loadCircuitJsonConverter<CircuitJsonToReadableNetlistModule>(
      "circuit-json-to-readable-netlist",
    )
  }

export const loadCircuitJsonToSpice =
  async (): Promise<CircuitJsonToSpiceModule> => {
    return loadCircuitJsonConverter<CircuitJsonToSpiceModule>(
      "circuit-json-to-spice",
    )
  }

export const loadCircuitJsonToStep =
  async (): Promise<CircuitJsonToStepModule> => {
    // circuit-json-to-step dynamically imports circuit-json-to-gltf at runtime.
    await ensureCircuitJsonToGltfLoaded()

    return loadCircuitJsonConverter<CircuitJsonToStepModule>(
      "circuit-json-to-step",
    )
  }

export const loadCircuitJsonToTscircuit =
  async (): Promise<CircuitJsonToTscircuitModule> => {
    return loadCircuitJsonConverter<CircuitJsonToTscircuitModule>(
      "circuit-json-to-tscircuit",
    )
  }
