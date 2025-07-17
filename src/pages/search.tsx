import Footer from "@/components/Footer"
import Header from "@/components/Header"
import PackageSearchResults from "@/components/PackageSearchResults"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAxios } from "@/hooks/useAxios"
import { usePackagesBaseApiUrl } from "@/hooks/use-packages-base-api-url"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { Search } from "lucide-react"
import React, { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { useSearchParams } from "wouter"

export const SearchPage = () => {
  const axios = useAxios()
  const apiBaseUrl = usePackagesBaseApiUrl()
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  )
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "stars")

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (category !== "all") params.set("category", category)
    if (sortBy !== "stars") params.set("sort", sortBy)
    setSearchParams(params)
  }, [searchQuery, category, sortBy, setSearchParams])

  const {
    data: packages,
    isLoading,
    error,
  } = useQuery(
    ["packageSearch", searchQuery, category],
    async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append("q", searchQuery)
      if (category !== "all") params.append("category", category)

      const response = await axios.post(`/packages/search`, {
        query: searchQuery,
      })
      return response.data.packages
    },
    { enabled: Boolean(searchQuery), keepPreviousData: true },
  )

  const filteredPackages = packages
    ?.filter((pkg: Package) => {
      if (!searchQuery) return true

      const query = searchQuery.toLowerCase().trim()
      const searchableFields = [
        pkg.unscoped_name.toLowerCase(),
        (pkg.owner_github_username || "").toLowerCase(),
        (pkg.description || "").toLowerCase(),
        pkg.description?.toLowerCase(),
      ]

      return searchableFields.some((field) => {
        const queryWords = query.split(/\s+/).filter((word) => word.length > 0)
        if (!field) return false
        return queryWords.every((word) => field.includes(word))
      })
    })
    ?.sort((a: Package, b: Package) => {
      if (sortBy === "stars") {
        return (b.star_count || 0) - (a.star_count || 0)
      } else if (sortBy === "newest") {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      } else if (sortBy === "oldest") {
        return (
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        )
      }
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-8xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Search Packages
                </h1>
              </div>
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
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stars">Most Starred</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <PackageSearchResults
              isLoading={isLoading}
              error={error}
              filteredPackages={filteredPackages}
              apiBaseUrl={apiBaseUrl}
              emptyStateMessage={
                searchQuery
                  ? `No packages match your search for "${searchQuery}".`
                  : "Please enter a search query to find packages."
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default SearchPage
