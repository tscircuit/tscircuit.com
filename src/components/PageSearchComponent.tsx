import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"
import React, { useState } from "react"
import { useQuery } from "react-query"
import { Alert } from "./ui/alert"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { PrefetchPageLink } from "./PrefetchPageLink"
import { Loader2 } from "lucide-react"

interface PageSearchComponentProps {
  onResultsFetched?: (results: any[]) => void
}

const PageSearchComponent: React.FC<PageSearchComponentProps> = ({
  onResultsFetched,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const axios = useAxios()
  const [location] = useLocation()
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const shouldOpenInNewTab = location === "/editor" || location === "/ai"
  const shouldOpenInEditor = location === "/editor" || location === "/ai"

  return (
    <div>
      <form onSubmit={handleSearch} className="w-full">
        <Input
          type="search"
          placeholder="Search packages..."
          className="pl-4 focus:border-blue-500 placeholder-gray-400 text-sm w-full h-12 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search packages"
          role="searchbox"
        />
      </form>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="mt-6 divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
          {searchResults.map((snippet: any) => (
            <div
              key={snippet.snippet_id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <PrefetchPageLink
                href={
                  shouldOpenInEditor
                    ? `/editor?snippet_id=${snippet.snippet_id}`
                    : `/${snippet.owner_name}/${snippet.unscoped_name}`
                }
                className="flex items-start gap-4"
              >
                <div className="w-16 h-16 overflow-hidden flex-shrink-0 rounded-sm border border-gray-100">
                  <img
                    src={`${snippetsBaseApiUrl}/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.svg`}
                    alt={`PCB preview for ${snippet.name}`}
                    className="w-full h-full object-contain p-1 scale-[4] rotate-45"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-medium text-blue-600 hover:underline truncate">
                    {snippet.name}
                  </h3>
                  {snippet.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {snippet.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>{snippet.owner_name}</span>
                    <span>•</span>
                    <span>
                      Created{" "}
                      {new Date(snippet.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </PrefetchPageLink>
            </div>
          ))}
        </div>
      )}

      {searchQuery && searchResults?.length === 0 && !isLoading && (
        <div className="mt-6">
          <Alert variant="default" className="bg-gray-50">
            <p>No packages found for "{searchQuery}"</p>
          </Alert>
        </div>
      )}
    </div>
  )
}

export default PageSearchComponent
