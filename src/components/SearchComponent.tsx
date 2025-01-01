import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { Link, useLocation } from "wouter"
import React, { useEffect, useRef, useState } from "react"
import { useQuery } from "react-query"
import { Alert } from "./ui/alert"

interface SearchComponentProps {
  onResultsFetched?: (results: any[]) => void // optional
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onResultsFetched,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const axios = useAxios()
  const resultsRef = useRef<HTMLDivElement>(null)
  const [location] = useLocation()

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
    setShowResults(!!searchQuery)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const shouldOpenInNewTab = location === "/editor" || location === "/ai"

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        type="search"
        placeholder="Search"
        className="pl-4 focus:border-blue-500 placeholder-gray-400 text-sm"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setShowResults(!!e.target.value)
        }}
      />
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md z-10 p-2 flex items-center justify-center space-x-2">
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      )}

      {showResults && searchResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md z-10 max-h-64 overflow-y-auto"
        >
          {searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {searchResults.map((snippet: any) => (
                <li key={snippet.snippet_id} className="p-2 hover:bg-gray-50">
                  {shouldOpenInNewTab ? (
                    <a
                      href={`/editor?snippet_id=${snippet.snippet_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="font-medium text-blue-600 break-words text-sm">
                        {snippet.name}
                      </div>
                      <div className="text-xs text-gray-500 break-words h-8 overflow-hidden">
                        {snippet.description}
                      </div>
                    </a>
                  ) : (
                    <Link
                      href={`/editor?snippet_id=${snippet.snippet_id}`}
                      className="block"
                    >
                      <div className="font-medium text-blue-600 break-words text-sm">
                        {snippet.name}
                      </div>
                      <div className="text-xs text-gray-500 break-words h-8 overflow-hidden">
                        {snippet.description}
                      </div>
                    </Link>
                  )}
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
