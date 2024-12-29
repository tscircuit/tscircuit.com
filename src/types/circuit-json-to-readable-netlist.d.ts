declare module "circuit-json-to-readable-netlist" {
  import { AnyCircuitElement } from "circuit-json"

  export function convertCircuitJsonToReadableNetlist(params: {
    elements: AnyCircuitElement[]
  }): string
}
