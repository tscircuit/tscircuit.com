import { useState, useEffect, useMemo } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useSearchParams } from "wouter"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import { Search, Building2 } from "lucide-react"
import PackageSearchResults, {
  LoadingState,
} from "@/components/PackageSearchResults"
import { OrgCard } from "@/components/OrgCard"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useGlobalStore } from "@/hooks/use-global-store"
import { fuzzyMatch } from "@/components/ViewPackagePage/utils/fuzz-search"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

interface ScoredPackage extends Package {
  score: number
  matches: number[]
}

interface ScoredOrg extends Omit<PublicOrgSchema, "github_handle"> {
  score: number
  matches: number[]
}

export const SearchPage = () => {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useGlobalStore((s) => s.session)

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  )
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "stars")
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "packages",
  )

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (category !== "all") params.set("category", category)
    if (sortBy !== "stars") params.set("sort", sortBy)
    if (activeTab !== "packages") params.set("tab", activeTab)
    setSearchParams(params)
  }, [searchQuery, category, sortBy, activeTab, setSearchParams])

  const {
    data: packages,
    isLoading: isLoadingPackages,
    error: packagesError,
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
    {
      enabled: Boolean(searchQuery),
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  )

  const { data: allOrgs = [], isLoading: isLoadingOrgs } = useQuery(
    ["orgSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      try {
        const { data } = await axios.post("/orgs/search", {
          query: searchQuery,
          limit: 20,
        })
        return data.orgs || []
      } catch (error) {
        console.warn("Failed to fetch orgs:", error)
        return []
      }
    },
    {
      enabled: Boolean(searchQuery) && Boolean(currentUser),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )

  const searchResults = useMemo((): ScoredPackage[] => {
    if (!searchQuery || !packages?.length) return []

    return packages
      .map((pkg: Package) => {
        const { score, matches } = fuzzyMatch(searchQuery, pkg.name)
        return { ...pkg, score, matches }
      })
      .filter((pkg: ScoredPackage) => pkg.score >= 0)
      .sort((a: ScoredPackage, b: ScoredPackage) => b.score - a.score)
  }, [packages, searchQuery])

  const filteredPackages = searchResults?.sort((a: Package, b: Package) => {
    if (sortBy === "stars") {
      return (b.star_count || 0) - (a.star_count || 0)
    } else if (sortBy === "newest") {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    }
    return 0
  })

  const orgSearchResults = useMemo((): ScoredOrg[] => {
    if (!searchQuery) return []

    const apiOrgs = allOrgs
      .map((org: PublicOrgSchema) => {
        const handle = org.tscircuit_handle || ""
        const { score, matches } = fuzzyMatch(searchQuery, handle)
        return { ...org, score, matches }
      })
      .filter((org: ScoredOrg) => org.score >= 0)
    const packageOwnerOrgs: ScoredOrg[] = []
    const existingHandles = new Set(
      apiOrgs.map((org: PublicOrgSchema) => org.tscircuit_handle),
    )
    filteredPackages.forEach((pkg) => {
      const ownerHandle = pkg.org_owner_tscircuit_handle

      if (ownerHandle && !existingHandles.has(ownerHandle)) {
        packageOwnerOrgs.push({
          org_id: "",
          owner_account_id: "",
          name: ownerHandle,
          member_count: 0,
          is_personal_org: false,
          package_count: 0,
          tscircuit_handle: ownerHandle,
          created_at: "",
          score: 1,
          matches: [],
        })
        existingHandles.add(ownerHandle)
      }
    })
    return [...apiOrgs, ...packageOwnerOrgs].sort(
      (a: ScoredOrg, b: ScoredOrg) => b.score - a.score,
    )
  }, [allOrgs, searchQuery, filteredPackages])

  useEffect(() => {
    if (orgSearchResults.length == 0 && !isLoadingOrgs) {
      setActiveTab("packages")
    }
  }, [orgSearchResults, isLoadingOrgs])
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-12 min-h-[80vh] w-full min-w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Search
                </h1>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search packages and users..."
                    className="pl-10"
                    value={searchQuery}
                    spellCheck={false}
                    autoComplete="off"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search packages and users"
                    role="searchbox"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[140px]">
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

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {orgSearchResults.length > 0 && (
                <TabsList className="grid grid-cols-2 mb-6 select-none w-full max-w-md mx-auto">
                  <TabsTrigger
                    value="packages"
                    className="flex items-center gap-2"
                  >
                    Packages
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="flex items-center gap-2"
                  >
                    Orgs
                  </TabsTrigger>
                </TabsList>
              )}

              <TabsContent value="packages" className="w-full">
                <PackageSearchResults
                  isLoading={isLoadingPackages}
                  error={packagesError}
                  filteredPackages={filteredPackages}
                  apiBaseUrl={apiBaseUrl}
                  emptyStateMessage={
                    searchQuery
                      ? `No packages match your search for "${searchQuery}".`
                      : "Please enter a search query to find packages."
                  }
                />
              </TabsContent>

              <TabsContent value="users" className="w-full">
                {isLoadingOrgs ? (
                  <div>
                    <LoadingState />
                  </div>
                ) : orgSearchResults.length > 0 ? (
                  <div className="grid grid-cols-1 w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {orgSearchResults.map((org, i) => (
                      <OrgCard key={i} org={org} className="w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
                      <Building2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 mb-2">
                      No Matching Organizations
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      {searchQuery
                        ? `No organizations match your search for "${searchQuery}".`
                        : "Please enter a search query to find organizations."}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default SearchPage
