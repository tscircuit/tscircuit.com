import { AnyCircuitElement } from "circuit-json"

export function convertCircuitJsonToReadableNetlist(params: {
  elements: AnyCircuitElement[]
}): string {
  const { elements } = params
  const netlist: string[] = []

  // Group elements by net
  const netGroups = new Map<string, AnyCircuitElement[]>()
  
  elements.forEach((element) => {
    const net = (element as any).net
    if (typeof net === "string") {
      if (!netGroups.has(net)) {
        netGroups.set(net, [])
      }
      netGroups.get(net)?.push(element)
    }
  })

  // Convert each net group to readable format
  netGroups.forEach((elements, net) => {
    const components = elements
      .map((element) => {
        const type = String((element as any).type || "unknown")
        const id = String((element as any).id || "unnamed")
        return `${type}:${id}`
      })
      .join(", ")
    
    netlist.push(`Net ${net}: ${components}`)
  })

  return netlist.join("\n")
}
