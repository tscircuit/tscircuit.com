import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { Package } from "fake-snippets-api/lib/db/schema"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Search, Keyboard, Cpu, Layers, LucideBellElectric } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PackageSearchResults from "@/components/PackageSearchResults"

const LatestPage: React.FC = () => {
  const axios = useAxios()
  const apiBaseUrl = useSnippetsBaseApiUrl()
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")

  const {
    data: packages,
    isLoading,
    error,
  } = useQuery<Package[]>(
    ["latestPackages", category],
    async () => {
      const params = category !== "all" ? { tag: category } : {}
      const response = await axios.get("/packages/list_latest", { params })
      return response.data.packages
    },
    {
      keepPreviousData: true,
    },
  )

  const filteredPackages = packages
    ?.filter((pkg) => {
      if (!searchQuery) return true

      const query = searchQuery.toLowerCase().trim()

      const searchableFields = [
        pkg.unscoped_name.toLowerCase(),
        pkg.owner_github_username?.toLowerCase() ?? "",
        (pkg.description || "").toLowerCase(),
      ]

      return searchableFields.some((field) => {
        const queryWords = query.split(/\s+/).filter((word) => word.length > 0)
        return queryWords.every((word) => field.includes(word))
      })
    })
    ?.sort((a, b) => b.created_at.localeCompare(a.created_at))

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-4xl font-bold text-gray-900">
              Latest Packages
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Explore the latest circuit designs from our community. These fresh
            additions showcase new ideas and innovative approaches to circuit
            design.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search latest packages..."
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
        <PackageSearchResults
          isLoading={isLoading}
          error={error}
          filteredPackages={filteredPackages}
          apiBaseUrl={apiBaseUrl}
          emptyStateMessage={
            searchQuery
              ? `No packages match your search for "${searchQuery}".`
              : category !== "all"
                ? `No ${category} packages found in the latest list.`
                : "There are no new packages at the moment."
          }
        />
      </main>
      <Footer />
    </div>
  )
}

export default LatestPage
