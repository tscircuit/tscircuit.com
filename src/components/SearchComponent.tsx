import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"
import React, { useEffect, useRef, useState } from "react"
import { useQuery } from "react-query"
import { Alert } from "./ui/alert"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { PrefetchPageLink } from "./PrefetchPageLink"
import { CircuitBoard } from "lucide-react"

interface SearchComponentProps {
  onResultsFetched?: (results: any[]) => void
  autofocus?: boolean
  closeOnClick?: () => void
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
  autofocus = false,
  closeOnClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const axios = useAxios()
  const resultsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [location, setLocation] = useLocation()
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()

  const { data: searchResults, isLoading } = useQuery(
    ["packageSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      const { data } = await axios.post("/packages/search", {
        query: searchQuery,
      })
      if (onResultsFetched) {
        onResultsFetched(data.packages)
      }
      return data.packages
    },
    { enabled: Boolean(searchQuery) },
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Focus input on mount
  useEffect(() => {
    if (autofocus) {
      inputRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowResults(false)
        if (closeOnClick) {
          closeOnClick()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [closeOnClick])

  const shouldOpenInNewTab = location === "/editor" || location === "/ai"
  const shouldOpenInEditor = location === "/editor" || location === "/ai"

  return (
    <form onSubmit={handleSearch} autoComplete="off" className="relative w-44">
      <Input
        autoComplete="off"
        spellCheck={false}
        ref={inputRef}
        type="search"
        placeholder="Search"
        className="pl-4 focus:border-blue-500 placeholder-gray-400 text-sm"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setShowResults(!!e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && !searchQuery && closeOnClick) {
            closeOnClick()
          }
        }}
        aria-label="Search packages"
        role="searchbox"
      />
      {isLoading && (
        <div className="absolute top-full w-lg left-0 right-0 mt-1 bg-white shadow-lg rounded-lg border w-80 grid place-items-center py-4 z-10 p-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 text-sm">Searching...</span>
          </div>
        </div>
      )}

      {showResults && searchResults && (
        <div
          ref={resultsRef}
          className="absolute top-full md:left-0 right-0 mt-2 bg-white shadow-lg rounded-md z-10 w-80 max-h-screen overflow-y-auto overflow-x-visible"
        >
          {searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {searchResults.map((pkg: any) => (
                <li key={pkg.package_id} className="p-2 hover:bg-gray-50">
                  <LinkWithNewTabHandling
                    href={
                      shouldOpenInEditor
                        ? `/editor?package_id=${pkg.package_id}`
                        : `/${pkg.name}`
                    }
                    shouldOpenInNewTab={shouldOpenInNewTab}
                    className="flex"
                  >
                    <div className="w-12 h-12 overflow-hidden mr-2 flex-shrink-0 rounded-sm bg-gray-50 border flex items-center justify-center">
                      <img
                        src={`${snippetsBaseApiUrl}/snippets/images/${pkg.name}/pcb.svg`}
                        alt={`PCB previeimage.pngw for ${pkg.name}`}
                        className="w-12 h-12 object-contain p-1 scale-[4] rotate-45"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden",
                          )
                          e.currentTarget.nextElementSibling?.classList.add(
                            "flex",
                          )
                        }}
                      />
                      <div className="w-12 h-12 hidden items-center justify-center">
                        <CircuitBoard className="w-6 h-6 text-gray-300" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-blue-600 break-words text-xs">
                        {pkg.name}
                      </div>
                      {pkg.description && (
                        <div className="text-xs text-gray-500 break-words h-8 overflow-hidden">
                          {pkg.description}
                        </div>
                      )}
                    </div>
                  </LinkWithNewTabHandling>
                </li>
              ))}
            </ul>
          ) : (
            <Alert variant="default" className="p-4 text-center">
              No results found for "{searchQuery}"
            </Alert>
          )}
        </div>
      )}
    </form>
  )
}

export default SearchComponent
