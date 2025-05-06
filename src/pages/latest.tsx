import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import {
  Search,
  Tag,
  Calendar,
  Keyboard,
  Cpu,
  Layers,
  LucideBellElectric,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SnippetCard } from "@/components/SnippetCard"
import { SnippetCardSkeleton } from "@/components/SnippetCardSkeleton"

const LatestPage: React.FC = () => {
  const axios = useAxios()
  const apiBaseUrl = useSnippetsBaseApiUrl()
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")

  const {
    data: snippets,
    isLoading,
    error,
  } = useQuery<Snippet[]>(
    ["latestSnippets", category],
    async () => {
      const params = category !== "all" ? { tag: category } : {}
      const response = await axios.get("/snippets/list_latest", { params })
      return response.data.snippets
    },
    {
      keepPreviousData: true,
    },
  )

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              Latest Snippets
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Explore the latest circuit designs from our community. These fresh
            additions showcase new ideas and innovative approaches to circuit
            design.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              <Tag className="w-3.5 h-3.5 mr-1" />
              <span>Latest Uploads</span>
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>Most Recent First</span>
            </Badge>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search latest snippets..."
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
              <SnippetCardSkeleton key={i} />
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
                  We couldn't load the latest snippets. Please try again later.
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
                  ? `No ${category} snippets found in the latest list.`
                  : "There are no new snippets at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnippets
              ?.sort((a, b) => b.created_at.localeCompare(a.created_at))
              ?.map((snippet) => (
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

export default LatestPage
