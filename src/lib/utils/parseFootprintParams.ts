export interface FootprintParams {
  [key: string]: string | number | boolean | string[]
}

/**
 * Parses and normalizes footprint parameters
 * @param params Raw parameters from footprint
 * @returns Normalized parameters with proper formatting
 */
export function parseFootprintParams(params: FootprintParams): FootprintParams {
  if (params.grid) {
    const grid = params.grid
    if (typeof grid === "object" && grid !== null) {
      const { x, y } = grid as any 
      params.grid = `${x}x${y}`
    } else if (typeof grid === "string") {
      const gridMatch = grid.match(/^(\d+)(?:x(\d+)?)?$/)
      if (gridMatch) {
        const [, x, y = x] = gridMatch
        params.grid = `${x}x${y}`
      }
    } else if (typeof grid === "number") {
      params.grid = `${grid}x${grid}`
    }
    delete params.grid3x3
  }

  if ("missing" in params && typeof params.missing === "string") {
    const value = params.missing
    if (value === "") {
      params.missing = []
    } else if (!Array.isArray(value)) {
      if (value.startsWith("missing(") && value.endsWith(")")) {
        const pinsStr = value.slice(8, -1)
        params.missing = pinsStr ? pinsStr.split(",").map((p) => p.trim()) : []
      } else {
        params.missing = value
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      }
    }
  }

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && !isNaN(Number(value)) && key !== "grid") {
      params[key] = Number(Number(value).toFixed(2))
    }
  })

  return params
}
