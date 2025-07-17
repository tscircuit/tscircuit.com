import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToAssemblySvg } from "circuit-to-svg"
import { saveAs } from "file-saver"

export const downloadAssemblySvg = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const svg = convertCircuitJsonToAssemblySvg(circuitJson);
  const blob = new Blob([svg], { type: "image/svg" });
  saveAs(blob, `${fileName}.svg`);
}
