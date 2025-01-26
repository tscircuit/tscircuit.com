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
      // 1. Default values
      const defaultValues = {
        gender: "male",
        pin_count: undefined as number | undefined,
      }
    
      // 2. Extract pin count from footprint if available
      if (!sourceComponent.pin_count && footprinterString) {
        const pinCountMatch = footprinterString.match(/(\d+)/)
        if (pinCountMatch) {
          defaultValues.pin_count = parseInt(pinCountMatch[1], 10)
        }
      }
    
      // 3. Use provided values or defaults
      const pin_count = sourceComponent.pin_count || defaultValues.pin_count
      const gender = sourceComponent.gender || defaultValues.gender
    
      // 4. Early validation
      if (!pin_count) {
        console.warn(`Pin count not found for pin header: ${sourceComponent.name}`)
        return {}
      }
    
      // 5. Extract pitch if available
      let pitch
      if (footprinterString?.includes("_p")) {
        pitch = footprinterString.split("_p")[1]
      }
    
      // 6. Call API with validated parameters
      try {
        const { headers } = await getJlcPartsCached(
          "headers",
          {
            ...(pitch ? { pitch } : {}),
            num_pins: pin_count,
            gender,
          }
        )
        return {
          jlcpcb: (headers || []).map((h: any) => `C${h.lcsc}`).slice(0, 3),
        }
      } catch (error: any) {
        console.error(`Error fetching pin header parts: ${error.message}`)
        return {}
      }
    }
    return {}
  },
}
