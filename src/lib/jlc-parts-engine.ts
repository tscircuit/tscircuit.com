import { type PartsEngine, SupplierPartNumbers } from "@tscircuit/props"
import { AnySourceComponent } from "circuit-json"
import qs from "qs"

const cache = new Map<string, any>()
const getJlcPartsCached = async (name: any, params: any) => {
  const paramString = qs.stringify({ ...params, json: "true" })
  if (cache.has(paramString)) {
    return cache.get(paramString)
  }
  const response = await fetch(
    `https://jlcsearch.tscircuit.com/${name}/list?${paramString}`,
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
    } else if (sourceComponent.ftype === "simple_pin_header") {
      let pitch
      if (footprinterString?.includes("_p")) {
        pitch = footprinterString.split("_p")[1]
      }
      const { headers } = await getJlcPartsCached(
        "headers",
        pitch
          ? {
              pitch: pitch,
              num_pins: sourceComponent.pin_count,
              gender: sourceComponent.gender,
            }
          : {
              num_pins: sourceComponent.pin_count,
              gender: sourceComponent.gender,
            },
      )
      return {
        jlcpcb: headers.map((h: any) => `C${h.lcsc}`).slice(0, 3),
      }
    }
    return {}
  },
}
