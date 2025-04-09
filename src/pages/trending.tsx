import React, { useState } from "react"
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

const TrendingPage: React.FC = () => {
  const axios = useAxios()
  const apiBaseUrl = useSnippetsBaseApiUrl()
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")

  const {
    data: snippets,
    isLoading,
    error,
  } = useQuery<Snippet[]>("trendingSnippets", async () => {
    const response = await axios.get("/snippets/list_trending")
    return response.data.snippets
  })

  const filteredSnippets = snippets?.filter((snippet) => {
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

  const filteredByTypeSnippets = filteredSnippets?.filter((snippet) => {
    if (category !== "all") {
      const description = (
        (snippet.description || "") + ((snippet as any).ai_description || "")
      ).toLowerCase()
      const name = snippet.unscoped_name.toLowerCase()

      switch (category) {
        case "keyboard":
          return (
            description.includes("keyboard") ||
            name.includes("keyboard") ||
            description.includes("keycap") ||
            name.includes("keycap") ||
            description.includes("keyboards") ||
            name.includes("keyboards")
          )
        case "microcontroller":
          return (
            description.includes("microcontroller") ||
            name.includes("mcu") ||
            description.includes("arduino") ||
            description.includes("esp32") ||
            description.includes("raspberry") ||
            name.includes("arduino") ||
            name.includes("esp32") ||
            name.includes("raspberry")
          )
        case "connector":
          return (
            description.includes("connector") ||
            name.includes("connector") ||
            description.includes("jack") ||
            name.includes("jack") ||
            description.includes("socket") ||
            name.includes("socket")
          )
        case "sensor":
          return (
            description.includes("sensor") ||
            name.includes("sensor") ||
            description.includes("detector") ||
            name.includes("detector")
          )
        default:
          return true
      }
    }

    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-6 h-6 text-amber-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              Trending Snippets
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Discover the most popular and innovative snippets from the community
            over the last 7 days. These trending designs showcase the best in
            circuit creativity and technical excellence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              <Tag className="w-3.5 h-3.5 mr-1" />
              <span>Most Starred</span>
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>Last 7 Days</span>
            </Badge>
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
        ) : filteredByTypeSnippets?.length === 0 ? (
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
            {filteredByTypeSnippets
              ?.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
              ?.map((snippet) => (
                <Link
                  key={snippet.snippet_id}
                  href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
                >
                  <div className="border p-4 rounded-md hover:shadow-md transition-shadow flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                        <OptimizedImage
                          src={`${apiBaseUrl}/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.svg`}
                          alt={`${snippet.owner_name}'s profile`}
                          className="object-cover h-full w-full transition-transform duration-300 -rotate-45 hover:rotate-0 hover:scale-110 scale-150"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-[2px] -mt-[3px]">
                          <h2 className="text-md font-semibold truncate pr-[30px]">
                            <span className="text-gray-700 text-md">
                              {snippet.owner_name}
                            </span>
                            <span className="mx-1">/</span>
                            <span className="text-gray-900">
                              {snippet.unscoped_name}
                            </span>
                          </h2>
                          <div className="flex items-center gap-2">
                            <SnippetTypeIcon
                              type={snippet.snippet_type}
                              className="pt-[2.5px]"
                            />
                            <div className="flex items-center gap-1 text-gray-600">
                              <StarIcon className="w-4 h-4 pt-[2.5px]" />
                              <span className="text-[16px]">
                                {snippet.star_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p
                          className={`${
                            !snippet.description &&
                            !(snippet as any).ai_description &&
                            "h-[1.25rem]"
                          } text-sm text-gray-500 mb-1 truncate max-w-xs`}
                        >
                          {snippet.description ||
                            (snippet as any).ai_description ||
                            "No description provided yet"}
                        </p>
                        <div className={`flex items-center gap-4`}>
                          {snippet.is_private ? (
                            <div className="flex items-center text-xs gap-1 text-gray-500">
                              <LockClosedIcon height={12} width={12} />
                              <span>Private</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-xs gap-1 text-gray-500">
                              <GlobeIcon height={12} width={12} />
                              <span>Public</span>
                            </div>
                          )}
                          <div className="flex items-center text-xs gap-1 text-gray-500">
                            <PencilIcon height={12} width={12} />
                            <span>{timeAgo(new Date(snippet.updated_at))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default TrendingPage
