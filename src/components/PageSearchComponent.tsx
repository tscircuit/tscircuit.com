import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"
import React, { useState } from "react"
import { useQuery } from "react-query"
import { Alert } from "./ui/alert"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { Loader2 } from "lucide-react"
import { SnippetCard } from "./SnippetCard"

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

  const shouldOpenInEditor = location === "/editor" || location === "/ai"

  return (
    <div className="min-h-[400px]">
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
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4">
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
