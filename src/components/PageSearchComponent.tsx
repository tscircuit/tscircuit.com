import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"
import React, { useState } from "react"
import { useQuery } from "react-query"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { Search } from "lucide-react"
import { Button } from "./ui/button"
import { PackageCardSkeleton } from "./PackageCardSkeleton"
import { PackageCard } from "./PackageCard"

interface PageSearchComponentProps {
  onResultsFetched?: (results: any[]) => void
}

const EXAMPLE_SEARCHES = ["keyboard", "esp32", "arduino"]

const PageSearchComponent: React.FC<PageSearchComponentProps> = ({
  onResultsFetched,
}) => {
  const [location, setLocation] = useLocation()
  const axios = useAxios()
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()

  // Initialize search query directly from URL
  const [searchQuery, setSearchQuery] = useState(
    () => new URLSearchParams(window.location.search).get("q") ?? "",
  )

  const { data: searchResults, isLoading: isLoadingSearchResults } = useQuery(
    ["packageSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      const { data } = await axios.get("/packages/search", {
        params: { q: searchQuery },
      })
      if (onResultsFetched) {
        onResultsFetched(data.packages)
      }
      return data.packages
    },
    { enabled: Boolean(searchQuery), keepPreviousData: false },
  )

  // Update URL while preserving other parameters
  const handleSearchChange = (newQuery: string) => {
    if (!newQuery.trim()) {
      // if empty reset
      setSearchQuery("")
      const params = new URLSearchParams(window.location.search)
      params.delete("q")
      const baseUrl = location.split("?")[0]
      const newUrl = params.toString()
        ? `${baseUrl}?${params.toString()}`
        : baseUrl
      setLocation(newUrl)
      return
    }
    setSearchQuery(newQuery)
    const params = new URLSearchParams(window.location.search)
    params.set("q", newQuery)
    const baseUrl = location.split("?")[0]
    const newUrl = `${baseUrl}?${params.toString()}`

    if (newUrl !== location) {
      setLocation(newUrl)
    }
  }

  return (
    <div className="min-h-[calc(100vh-20rem)]">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search packages..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Search packages"
              role="searchbox"
            />
          </div>
        </div>
      </div>

      {isLoadingSearchResults ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <PackageCardSkeleton key={i} />
          ))}
        </div>
      ) : searchQuery && (!searchResults || searchResults.length === 0) ? (
        <div className="text-center py-12 px-4">
          <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">
            No Results for "{searchQuery}"
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Try searching for something else or browse trending packages.
          </p>
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((pkg: any) => (
            <PackageCard
              key={pkg.package_id}
              pkg={pkg}
              baseUrl={snippetsBaseApiUrl}
              showOwner={true}
              withLink={true}
              className="hover:bg-gray-50"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">
            Search for any package above
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Try searching for:
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {EXAMPLE_SEARCHES.map((term) => (
              <Button
                key={term}
                variant="outline"
                onClick={() => handleSearchChange(term)}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PageSearchComponent
