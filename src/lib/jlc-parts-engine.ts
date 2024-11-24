import { type PartsEngine, SupplierPartNumbers } from "@tscircuit/props"
import { AnySourceComponent } from "circuit-json"
import qs from "qs"

const cache = new Map<string, any>()
const getJlcPartsCached = async (name: any, params: any) => {
  console.log(params)
  const paramString = qs.stringify({ ...params, json: "true" })
  if (cache.has(paramString)) {
    return cache.get(paramString)
  }
  // console.log(paramString)
  const response = await fetch(
    `https://jlcsearch.tscircuit.com/${name}/list?${paramString}`,
  )
  const responseJson = await response.json()
  cache.set(paramString, responseJson)
  // console.log(responseJson)
  return responseJson
}

export const jlcPartsEngine: PartsEngine = {
  findPart: async ({
    sourceComponent,
    footprinterString,
  }): Promise<SupplierPartNumbers> => {
    if (sourceComponent.ftype === "simple_resistor") {
      const { resistors } = await getJlcPartsCached("resistors", {
        resistance: sourceComponent.resistance,
        package: footprinterString,
      })

      return {
        jlcpcb: resistors.map((r: any) => `C${r.lcsc}`).slice(0, 3),
      }
    } else if (sourceComponent.ftype === "simple_capacitor") {
      if (footprinterString?.includes("cap")) {
        footprinterString = footprinterString.replace("cap", "")
      }
      const { capacitors } = await getJlcPartsCached("capacitors", {
        capacitance: sourceComponent.capacitance,
        package: footprinterString,
      })

      return {
        jlcpcb: capacitors.map((c: any) => `C${c.lcsc}`).slice(0, 3),
      }
    }
    return {}
  },
}
