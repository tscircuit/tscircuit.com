/**
 * tscircuit Registry API service for fetching component data from the tscircuit registry API
 */

interface TscircuitSnippet {
  snippet_id: string
  package_release_id: string
  unscoped_name: string
  name: string
  owner_name: string
  code: string
  description?: string
  preview_url?: string
}

interface TscircuitSearchResponse {
  snippets: TscircuitSnippet[]
}

/**
 * Search for components in the tscircuit registry
 * @param query Search query string
 * @param limit Maximum number of results to return (default: 10)
 * @returns Promise with search results
 */
export const searchTscircuitComponents = async (
  query: string,
  limit = 10,
): Promise<TscircuitSnippet[]> => {
  try {
    // Encode the query parameters
    const encodedQuery = encodeURIComponent(query)

    // Make the API request
    const response = await fetch(
      `https://registry-api.tscircuit.com/snippets/search?q=${encodedQuery}&limit=${limit}`,
    )

    if (!response.ok) {
      throw new Error(
        `tscircuit Registry API error: ${response.status} ${response.statusText}`,
      )
    }

    const data: TscircuitSearchResponse = await response.json()
    return data.snippets || []
  } catch (error) {
    console.error("Error searching tscircuit components:", error)
    throw error
  }
}

/**
 * Map tscircuit component data to the ComponentSearchResult format used in the ImportComponentDialog
 * @param tscircuitSnippet tscircuit component data
 * @returns Formatted component data for the UI
 */
export const mapTscircuitSnippetToSearchResult = (
  tscircuitSnippet: TscircuitSnippet,
) => {
  return {
    id: `tscircuit-${tscircuitSnippet.snippet_id}`,
    name: tscircuitSnippet.unscoped_name,
    description:
      tscircuitSnippet.description ||
      `Component by ${tscircuitSnippet.owner_name}`,
    source: "tscircuit.com" as const,
    partNumber: tscircuitSnippet.name,
    previewUrl: tscircuitSnippet.preview_url,
    // Additional tscircuit-specific properties
    code: tscircuitSnippet.code,
    owner: tscircuitSnippet.owner_name,
  }
}