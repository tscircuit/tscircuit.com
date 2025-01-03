import { saveAs } from "file-saver"
import { useSaveGltfAs } from "@tscircuit/3d-viewer"

export const downloadGltfFile = (circuitJson: any, filename: string) => {
  const blob = new Blob([JSON.stringify(circuitJson)], {
    type: "model/gltf+json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.gltf`
  a.click()
  URL.revokeObjectURL(url)
}
