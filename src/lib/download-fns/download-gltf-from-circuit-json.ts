import { CircuitJson } from "circuit-json"
import { saveAs } from "file-saver"
import {
  convertCircuitJsonToGltf,
  type ConversionOptions,
} from "circuit-json-to-gltf"
export const downloadGltfFromCircuitJson = async (
  circuitJson: CircuitJson,
  fileName: string,
  options?: ConversionOptions,
) => {
  const result = await convertCircuitJsonToGltf(circuitJson, options)

  let blob: Blob
  let extension = options?.format === "glb" ? ".glb" : ".gltf"

  if (result instanceof ArrayBuffer) {
    blob = new Blob([result], { type: "model/gltf-binary" })
    extension = options?.format
      ? options.format === "glb"
        ? ".glb"
        : ".gltf"
      : ".glb"
  } else if (
    typeof ArrayBuffer !== "undefined" &&
    result &&
    typeof (result as any).buffer === "object" &&
    (result as any).byteLength !== undefined
  ) {
    const view = result as ArrayBuffer
    blob = new Blob([view], { type: "model/gltf-binary" })
    extension = options?.format
      ? options.format === "glb"
        ? ".glb"
        : ".gltf"
      : ".glb"
  } else if (typeof result === "string") {
    blob = new Blob([result], { type: "model/gltf+json" })
  } else {
    blob = new Blob([JSON.stringify(result)], { type: "model/gltf+json" })
  }

  saveAs(blob, fileName + extension)
}
