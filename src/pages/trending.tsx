import React, { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "wouter"
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

const TrendingPage: React.FC = () => {
  const axios = useAxios()
  const apiBaseUrl = useSnippetsBaseApiUrl()

  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [timeRange, setTimeRange] = useState("all")
  const [sortBy, setSortBy] = useState("stars")

  const {
    data: snippets,
    isLoading,
    error,
  } = useQuery<Snippet[]>(
    ["trendingSnippets", category, timeRange],
    async () => {
      const params: Record<string, string> = {}
      if (category !== "all") params.tag = category
      if (timeRange !== "all") params.timeRange = timeRange

      const response = await axios.get("/snippets/list_trending", { params })
      return response.data.snippets
    },
    { keepPreviousData: true },
  )

  const filteredSnippets = snippets
    ?.filter((snippet) => {
      if (!searchQuery.trim()) return true
      const queryWords = searchQuery.toLowerCase().trim().split(/\s+/)
      return
      ;[
        snippet.unscoped_name,
        snippet.owner_name,
        snippet.description || "",
      ].some((field) =>
        queryWords.every((word) => field.toLowerCase().includes(word)),
      )
    })
    ?.sort((a, b) => {
      if (sortBy === "stars") {
        return (b.star_count || 0) - (a.star_count || 0)
      }
      if (sortBy === "recent") {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      }
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-4xl font-bold text-gray-900">
              Trending Snippets
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Explore trending snippets from our creative community.
          </p>
          <div className="flex flex-wrap gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Tag className="w-3.5 h-3.5 mr-1" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">Most Starred</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
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
        ) : filteredSnippets?.length === 0 ? (
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
        ) : (
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
        )}
      </main>
      <Footer />
    </div>
  )
}

export default TrendingPage
