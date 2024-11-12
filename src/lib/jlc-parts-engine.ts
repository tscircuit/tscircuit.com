import { type PartsEngine, SupplierPartNumbers } from "@tscircuit/props"
import { AnySourceComponent } from "circuit-json"
import qs from "qs"

const getJlcPartsCached = (params: any) => {
  const paramString = qs.stringify({ ...params, json: "true" })
  // const cacheKey =
}

export const jlcPartsEngine: PartsEngine = {
  findPart: async ({
    sourceComponent,
    footprinterString,
  }): Promise<SupplierPartNumbers> => {
    if (sourceComponent.ftype === "simple_resistor") {
      const response = await fetch(
        `https://jlcsearch.tscircuit.com/resistors/list?resistance=${sourceComponent.resistance}&package=${footprinterString}&json=true`,
      )
      const { resistors } = await response.json()

      return {
        jlcpcb: resistors.map((r: any) => `C${r.lcsc}`).slice(0, 3),
      }
    }
    return {}
  },
}
