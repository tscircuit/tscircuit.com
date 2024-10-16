import { HeaderLogin } from "@/components/HeaderLogin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { cn } from "@/lib/utils"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Menu, Search, X } from "lucide-react"
import React, { useState } from "react"
import { useQuery } from "react-query"
import { Link, useLocation } from "wouter"
import HeaderDropdown from "./HeaderDropdown"

const HeaderButton = ({
  href,
  children,
  className,
  alsoHighlightForUrl,
}: {
  href: string
  children: React.ReactNode
  className?: string
  alsoHighlightForUrl?: string
}) => {
  const [location] = useLocation()

  if (location === href || location === alsoHighlightForUrl) {
    return (
      <Button
        variant="ghost"
        className={`border-b-2 rounded-none border-blue-600 header-button ${className}`}
      >
        {children}
      </Button>
    )
  }

  return (
    <Link className={cn("header-button", className)} href={href}>
      <Button className={className} variant="ghost">
        {children}
      </Button>
    </Link>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const axios = useAxios()

  const { data: searchResults, isLoading } = useQuery(
    ['snippetSearch', searchQuery],
    async () => {
      if (!searchQuery) return []
      const { data } = await axios.get("/snippets/search", {
        params: { q: searchQuery }
      })
      return data.snippets
    },
    { enabled: Boolean(searchQuery) }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

   const renderSearchResults = () => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden z-10">
      {searchResults && searchResults.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {searchResults.map((snippet: any) => (
            <li key={snippet.snippet_id} className="p-4 hover:bg-gray-50">
              <Link href={`/editor?snippet_id=${snippet.snippet_id}`}>
                <div className="font-medium text-blue-600">{snippet.name}</div>
                <div className="text-sm text-gray-500">{snippet.description}</div>
              </Link>
            </li>
          ))}
        </ul>
      ) : searchQuery && !isLoading ? (
        <div className="p-4">
          No results found for "{searchQuery}"
        </div>
      ) : null}
    </div>
  )

  return (
    <header className="px-4 py-3">
      <div className="flex items-center">
        <Link href="/" className="text-lg font-semibold whitespace-nowrap">
          <span className="bg-blue-500 px-2 py-1 rounded-md text-white">
            tscircuit
          </span>{" "}
          <span className="text-gray-800">snippets</span>
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <nav>
            <ul className="flex items-center gap-2 ml-2">
            {isLoggedIn && (
                <li>
                  <HeaderButton href="/dashboard">Dashboard</HeaderButton>
                </li>
              )}
              <li>
                <HeaderButton href="/newest">Newest</HeaderButton>
              </li>
              <li>
                <HeaderButton href="/quickstart" alsoHighlightForUrl="/editor">
                  Editor
                </HeaderButton>
              </li>
              <li>
                <HeaderButton href="/ai">AI</HeaderButton>
              </li>
              <li>
                <a href="https://docs.tscircuit.com">
                  <Button variant="ghost">Docs</Button>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex-grow"></div>
        <a
          href="https://github.com/tscircuit/tscircuit"
          target="_blank"
          className="mr-4"
        >
          <GitHubLogoIcon className="text-gray-400 hover:text-gray-600 transition-colors" />
        </a>
        {/* <a href="https://tscircuit.com/join" target="_blank" className="mr-2">
          <DiscordLogoIcon className="text-gray-400 hover:text-gray-600 transition-colors" />
        </a> */}
        <div className="hidden md:flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              type="search"
              placeholder="Search"
              className="pl-8 focus:border-blue-500 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isLoading && <span className="absolute right-2 top-1/2 transform -translate-y-1/2">Loading...</span>}
            {searchQuery && renderSearchResults()}
          </form>
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 z-10">
              {renderSearchResults()}
            </div>
          )}
          <HeaderDropdown />
          <HeaderLogin />
        </div>
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden mt-4">
          <nav className="mb-4">
            <ul className="flex flex-col gap-2 w-full">
            {isLoggedIn && (
                <li>
                  <HeaderButton
                    className="w-full justify-start"
                    href="/dashboard"
                  >
                    Dashboard
                  </HeaderButton>
                </li>
              )}
              <li>
                <HeaderButton className="w-full justify-start" href="/newest">
                  Newest
                </HeaderButton>
              </li>
              <li>
                <HeaderButton
                  className="w-full justify-start"
                  href="/quickstart"
                  alsoHighlightForUrl="/editor"
                >
                  Editor
                </HeaderButton>
              </li>
              <li>
                <HeaderButton className="w-full justify-start" href="/ai">
                  AI
                </HeaderButton>
              </li>
              <li>
                <HeaderButton
                  className="w-full justify-start"
                  href="https://docs.tscircuit.com"
                >
                  Docs
                </HeaderButton>
              </li>
            </ul>
          </nav>
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                type="search"
                placeholder="Search"
                className="pl-8 focus:border-blue-500 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isLoading && <span className="absolute right-2 top-1/2 transform -translate-y-1/2">Loading...</span>}
            </form>
            {searchQuery && renderSearchResults()}
            <HeaderDropdown />
            <HeaderLogin />
          </div>
        </div>
      )}
    </header>
  )
}