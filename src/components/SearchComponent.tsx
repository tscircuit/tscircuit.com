import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import React, { useState } from "react"
import { useQuery } from "react-query"
import { Link } from "wouter"
import { Alert } from "./ui/alert"

interface SearchComponentProps {
  onResultsFetched: (results: any[]) => void
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onResultsFetched,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const axios = useAxios()

  const { data: searchResults, isLoading } = useQuery(
    ["snippetSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      const { data } = await axios.get("/snippets/search", {
        params: { q: searchQuery },
      })
      onResultsFetched(data.snippets)
      return data.snippets
    },
    { enabled: Boolean(searchQuery) },
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        type="search"
        placeholder="Search"
        className="pl-4 focus:border-blue-500 placeholder-gray-400"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md z-10 p-2 flex items-center justify-center space-x-2">
          <span className="text-gray-500">Loading...</span>
        </div>
      )}

      {searchQuery && searchResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md z-10">
          {searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {searchResults.map((snippet: any) => (
                <li key={snippet.snippet_id} className="p-4 hover:bg-gray-50">
                  <Link href={`/editor?snippet_id=${snippet.snippet_id}`}>
                    <div className="font-medium text-blue-600">
                      {snippet.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {snippet.description}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Alert variant="default" className="p-4">
              No results found for "{searchQuery}"
            </Alert>
          )}
        </div>
      )}
    </form>
  )
}

export default SearchComponent
