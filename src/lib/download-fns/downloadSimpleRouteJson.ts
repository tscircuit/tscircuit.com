import { getSimpleRouteJsonFromCircuitJson } from "@tscircuit/core"
import type { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"

export const downloadSimpleRouteJson = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
) => {
  const simpleRouteJson = getSimpleRouteJsonFromCircuitJson({
    circuitJson: circuitJson as any,
    minTraceWidth: 0.1,
  })
  const blob = new Blob([JSON.stringify(simpleRouteJson, null, 2)], {
    type: "application/json",
  })
  saveAs(blob, `${fileName}_routes.json`)
}
