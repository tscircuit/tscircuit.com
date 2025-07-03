/**
 * JLC API service for fetching component data from the JLC search API
 */

interface JLCComponent {
  description: string
  lcsc: number
  mfr: string
  package: string
  price: number
}

interface JLCSearchResponse {
  components: JLCComponent[]
}

/**
 * Search for components in the JLC database
 * @param query Search query string
 * @param limit Maximum number of results to return (default: 10)
 * @returns Promise with search results
 */
export const searchJLCComponents = async (
  query: string,
  limit = 10,
): Promise<JLCComponent[]> => {
  try {
    // Encode the query parameters
    const encodedQuery = encodeURIComponent(query)

    // Make the API request
    const response = await fetch(
      `https://jlcsearch.tscircuit.com/api/search?limit=${limit}&q=${encodedQuery}`,
    )

    if (!response.ok) {
      throw new Error(
        `JLC API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: JLCSearchResponse = await response.json()
    return data.components || []
  } catch (error) {
    console.error("Error searching JLC components:", error)
    throw error
  }
}

/**
 * Map JLC component data to the ComponentSearchResult format used in the ImportComponentDialog
 * @param jlcComponent JLC component data
 * @returns Formatted component data for the UI
 */
export const mapJLCComponentToSearchResult = (jlcComponent: JLCComponent) => {
  return {
    id: `jlc-${jlcComponent.lcsc}`,
    name: jlcComponent.mfr,
    description: jlcComponent.description,
    source: "jlcpcb" as const,
    partNumber: `C${jlcComponent.lcsc}`,
    package: jlcComponent.package,
    price: jlcComponent.price,
  }
}