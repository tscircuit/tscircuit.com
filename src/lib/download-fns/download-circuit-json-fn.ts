import { saveAs } from "file-saver"
import { createBlobURL } from "./createBlobURL"
export const downloadCircuitJson = (content: any, fileName: string) => {
  try {
    const circuitJson = JSON.stringify(content, null, 2)
    const blob = new Blob([circuitJson], { type: "application/json" })
    saveAs(blob, fileName)
  } catch (error) {
    throw error
  }
}
