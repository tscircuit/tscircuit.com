import { type PartsEngine, SupplierPartNumbers } from "@tscircuit/props"
import { AnySourceComponent } from "circuit-json"
import qs from "qs"

const cache = new Map<string, any>()
const getJlcPartsCached = async (params: any) => {
  const paramString = qs.stringify({ ...params, json: "true" })
  if (cache.has(paramString)) {
    return cache.get(paramString)
  }
  const response = await fetch(
    `https://jlcsearch.tscircuit.com/resistors/list?${paramString}`,
  )
  const responseJson = await response.json()
  cache.set(paramString, responseJson)
  return responseJson
}

export const jlcPartsEngine: PartsEngine = {
  findPart: async ({
    sourceComponent,
    footprinterString,
  }): Promise<SupplierPartNumbers> => {
    if (sourceComponent.ftype === "simple_resistor") {
      const { resistors } = await getJlcPartsCached({
        resistance: sourceComponent.resistance,
        package: footprinterString,
      })

      return {
        jlcpcb: resistors.map((r: any) => `C${r.lcsc}`).slice(0, 3),
      }
    }
    return {}
  },
}
