import { cju } from "@tscircuit/circuit-json-util"
import { AnyCircuitElement } from "circuit-json"
 
export const getCircuitFromJson = (circuitJson: AnyCircuitElement[]) => {
    return cju(circuitJson)
}