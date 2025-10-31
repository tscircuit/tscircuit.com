import { useState, useEffect, useMemo } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useSearchParams } from "wouter"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Input } from "@/components/ui/input"
import { Search, User } from "lucide-react"
import PackageSearchResults, {
  LoadingState,
} from "@/components/PackageSearchResults"
import { UserCard } from "@/components/UserCard"
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
import { Package, Account } from "fake-snippets-api/lib/db/schema"

interface ScoredPackage extends Package {
  score: number
  matches: number[]
}

interface ScoredAccount
  extends Omit<
    Account,
    "account_id" | "is_tscircuit_staff" | "tscircuit_handle"
  > {
  score: number
  matches: number[]
}

export const SearchPage = () => {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useGlobalStore((s) => s.session?.github_username)

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

  const { data: allAccounts = [], isLoading: isLoadingAccounts } = useQuery(
    ["accountSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      try {
        const { data } = await axios.post("/accounts/search", {
          query: searchQuery,
          limit: 20,
        })
        return data.accounts || []
      } catch (error) {
        console.warn("Failed to fetch accounts:", error)
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

  const accountSearchResults = useMemo((): ScoredAccount[] => {
    if (!searchQuery) return []

    // First, get scored accounts from API
    const apiAccounts = allAccounts
      .map((account: Account) => {
        const { score, matches } = fuzzyMatch(
          searchQuery,
          account.github_username,
        )
        return { ...account, score, matches }
      })
      .filter((account: ScoredAccount) => account.score >= 0)

    // Then, extract unique package owners not already in API accounts
    const packageOwners: ScoredAccount[] = []
    const existingUsernames = new Set(
      apiAccounts.map((acc: Account) => acc.github_username),
    )

    filteredPackages.forEach((pkg) => {
      if (
        pkg.owner_github_username &&
        !existingUsernames.has(pkg.owner_github_username)
      ) {
        packageOwners.push({
          github_username: pkg.owner_github_username,
          score: 1,
          matches: [],
        })
        existingUsernames.add(pkg.owner_github_username)
      }
    })
    return [...apiAccounts, ...packageOwners].sort(
      (a: ScoredAccount, b: ScoredAccount) => b.score - a.score,
    )
  }, [allAccounts, searchQuery, filteredPackages])

  useEffect(() => {
    if (accountSearchResults.length == 0 && !isLoadingAccounts) {
      setActiveTab("packages")
    }
  }, [accountSearchResults, isLoadingAccounts])
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
              {currentUser && accountSearchResults.length > 0 && (
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
                    Users
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
                {isLoadingAccounts ? (
                  <div>
                    <LoadingState />
                  </div>
                ) : accountSearchResults.length > 0 ? (
                  <div className="grid grid-cols-1 w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {accountSearchResults.map((account, i) => (
                      <UserCard
                        key={i}
                        account={account as unknown as Account}
                        className="w-full"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 mb-2">
                      No Matching Users
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      {searchQuery
                        ? `No users match your search for "${searchQuery}".`
                        : "Please enter a search query to find users."}
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
