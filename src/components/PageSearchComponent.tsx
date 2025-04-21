import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"
import React, { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { Alert } from "./ui/alert"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { Loader2, Search } from "lucide-react"
import { SnippetCard } from "./SnippetCard"

interface PageSearchComponentProps {
  onResultsFetched?: (results: any[]) => void
}

const PageSearchComponent: React.FC<PageSearchComponentProps> = ({
  onResultsFetched,
}) => {
  const [location, setLocation] = useLocation()
  const axios = useAxios()
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()

  const initialQuery =
    new URLSearchParams(window.location.search).get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const { data: searchResults, isLoading } = useQuery(
    ["snippetSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      const { data } = await axios.get("/snippets/search", {
        params: { q: searchQuery },
      })
      if (onResultsFetched) {
        onResultsFetched(data.snippets)
      }
      return data.snippets
    },
    { enabled: Boolean(searchQuery) },
  )

  useEffect(() => {
    const baseUrl = location.split("?")[0]
    const newUrl = searchQuery
      ? `${baseUrl}?q=${encodeURIComponent(searchQuery)}`
      : baseUrl
    if (newUrl !== location) {
      setLocation(newUrl)
    }
  }, [searchQuery, location, setLocation])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlQuery = params.get("q")
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery)
    }
  }, [location])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const shouldOpenInEditor = location === "/editor" || location === "/ai"

  return (
    <div className="min-h-[400px]">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search packages..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search packages"
              role="searchbox"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border p-4 rounded-md animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 rounded-md bg-slate-200"></div>
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((snippet: any) => (
            <SnippetCard
              key={snippet.snippet_id}
              snippet={snippet}
              baseUrl={snippetsBaseApiUrl}
              showOwner={true}
              withLink={!shouldOpenInEditor}
              className="hover:bg-gray-50"
              renderActions={shouldOpenInEditor ? () => null : undefined}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12 px-4">
          <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">
            No Matching Packages
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            No packages match your search for "{searchQuery}".
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default PageSearchComponent
