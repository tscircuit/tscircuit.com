import React, { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link, useLocation, useSearchParams } from "wouter"
import { StarIcon, LockClosedIcon } from "@radix-ui/react-icons"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { OptimizedImage } from "@/components/OptimizedImage"
import {
  GlobeIcon,
  PencilIcon,
  Zap,
  Tag,
  Calendar,
  Search,
  Keyboard,
  Cpu,
  Layers,
  LucideBellElectric,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SnippetTypeIcon } from "@/components/SnippetTypeIcon"
import { timeAgo } from "@/lib/utils/timeAgo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SnippetCard } from "@/components/SnippetCard"
import { PackageCardSkeleton } from "@/components/PackageCardSkeleton"

const TrendingPage: React.FC = () => {
  const axios = useAxios()
  const apiBaseUrl = useSnippetsBaseApiUrl()
  const [searchParams, setSearchParams] = useSearchParams()

  // Initialize state from URL params or defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  )
  const [time_period, setTimePeriod] = useState(
    searchParams.get("time_period") || "all",
  )
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "stars")

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (category !== "all") params.set("category", category)
    if (time_period !== "all") params.set("time_period", time_period)
    if (sortBy !== "stars") params.set("sort", sortBy)
    setSearchParams(params)
  }, [searchQuery, category, time_period, sortBy, setSearchParams])

  const {
    data: snippets,
    isLoading,
    error,
    refetch,
  } = useQuery<Snippet[]>(
    ["trendingSnippets", category, time_period],
    async () => {
      const params = new URLSearchParams()
      if (category !== "all") params.append("tag", category)
      params.append("time_period", time_period)

      const response = await axios.get(
        `/snippets/list_trending?${params.toString()}`,
      )
      return response.data.snippets
    },
    {
      keepPreviousData: true,
    },
  )

  const filteredSnippets = snippets
    ?.filter((snippet) => {
      if (!searchQuery) return true

      const query = searchQuery.toLowerCase().trim()

      const searchableFields = [
        snippet.unscoped_name.toLowerCase(),
        snippet.owner_name.toLowerCase(),
        (snippet.description || "").toLowerCase(),
      ]

      return searchableFields.some((field) => {
        const queryWords = query.split(/\s+/).filter((word) => word.length > 0)
        return queryWords.every((word) => field.includes(word))
      })
    })
    ?.sort((a, b) => {
      if (sortBy === "stars") {
        return (b.star_count || 0) - (a.star_count || 0)
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  console.log("Filtered Snippets:", filteredSnippets)
  console.log("Snippets:", snippets)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Trending Snippets
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Check out some of the top circuit designs from our community.
          </p>
          <div className="flex flex-wrap gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">Most Starred</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={time_period}
              onValueChange={setTimePeriod}
              disabled={sortBy === "recent"}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search trending snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="keyboard">
                  <div className="flex items-center">
                    <Keyboard className="mr-2 h-4 w-4" />
                    <span>Keyboards</span>
                  </div>
                </SelectItem>
                <SelectItem value="microcontroller">
                  <div className="flex items-center">
                    <Cpu className="mr-2 h-4 w-4" />
                    <span>Microcontrollers</span>
                  </div>
                </SelectItem>
                <SelectItem value="connector">
                  <div className="flex items-center">
                    <Layers className="mr-2 h-4 w-4" />
                    <span>Connectors</span>
                  </div>
                </SelectItem>
                <SelectItem value="sensor">
                  <div className="flex items-center">
                    <LucideBellElectric className="mr-2 h-4 w-4" />
                    <span>Sensors</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <PackageCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="mr-4 bg-red-100 p-2 rounded-full">
                <Search className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Error Loading Snippets
                </h3>
                <p className="text-red-600">
                  We couldn't load the trending snippets. Please try again
                  later.
                </p>
              </div>
            </div>
          </div>
        ) : filteredSnippets && filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnippets?.map((snippet) => (
              <SnippetCard
                key={snippet.snippet_id}
                snippet={snippet}
                baseUrl={apiBaseUrl}
                showOwner={true}
              />
            ))}
          </div>
        ) : (
          filteredSnippets?.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">
                No Matching Snippets
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                {searchQuery
                  ? `No snippets match your search for "${searchQuery}".`
                  : category !== "all"
                    ? `No ${category} snippets found in the trending list.`
                    : "There are no trending snippets at the moment."}
              </p>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  )
}

export default TrendingPage
