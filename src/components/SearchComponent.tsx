import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"
import React, { useEffect, useRef, useState } from "react"
import { useQuery } from "react-query"
import { Alert } from "./ui/alert"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { PrefetchPageLink } from "./PrefetchPageLink"

interface SearchComponentProps {
  onResultsFetched?: (results: any[]) => void // optional
}

const LinkWithNewTabHandling = ({
  shouldOpenInNewTab,
  href,
  className,
  children,
}: {
  shouldOpenInNewTab: boolean
  href: string
  className?: string
  children: React.ReactNode
}) => {
  if (shouldOpenInNewTab) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    )
  }
  return (
    <PrefetchPageLink className={className} href={href}>
      {children}
    </PrefetchPageLink>
  )
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onResultsFetched,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const axios = useAxios()
  const resultsRef = useRef<HTMLDivElement>(null)
  const [location] = useLocation()
  const { snippetsBaseApiUrl } = useSnippetsBaseApiUrl()

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
  const shouldOpenInEditor = location === "/editor" || location === "/ai"

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        type="search"
        placeholder="Search"
        className="pl-4 text-sm placeholder-gray-400 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setShowResults(!!e.target.value)
        }}
        aria-label="Search snippets"
        role="searchbox"
      />
      {isLoading && (
        <div className="absolute left-0 right-0 z-10 flex items-center justify-center p-2 mt-2 space-x-2 bg-white rounded-md shadow-lg top-full dark:bg-gray-900">
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
        </div>
      )}

      {showResults && searchResults && (
        <div
          ref={resultsRef}
          className="absolute right-0 z-10 max-h-screen mt-2 overflow-x-visible overflow-y-auto bg-white rounded-md shadow-lg top-full md:left-0 w-80 dark:bg-gray-900"
        >
          {searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((snippet: any) => (
                <li key={snippet.snippet_id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <LinkWithNewTabHandling
                    href={
                      shouldOpenInEditor
                        ? `/editor?snippet_id=${snippet.snippet_id}`
                        : `/${snippet.owner_name}/${snippet.unscoped_name}`
                    }
                    shouldOpenInNewTab={shouldOpenInNewTab}
                    className="flex"
                  >
                    <div className="flex-shrink-0 w-12 h-12 mr-2 overflow-hidden rounded-sm">
                      <img
                        src={`${useSnippetsBaseApiUrl()}/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.svg`}
                        alt={`PCB preview for ${snippet.name}`}
                        className="w-12 h-12 object-contain p-1 scale-[4] rotate-45"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="text-xs font-medium text-blue-600 break-words dark:text-blue-400">
                        {snippet.name}
                      </div>
                      {snippet.description && (
                        <div className="h-8 overflow-hidden text-xs text-gray-500 break-words dark:text-gray-400">
                          {snippet.description}
                        </div>
                      )}
                    </div>
                  </LinkWithNewTabHandling>
                </li>
              ))}
            </ul>
          ) : (
            <Alert variant="default" className="p-4 dark:bg-gray-800 dark:text-gray-100">
              No results found for "{searchQuery}"
            </Alert>
          )}
        </div>
      )}
    </form>
  )
}

export default SearchComponent
