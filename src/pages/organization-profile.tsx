import { useEffect, useState } from "react"
import { useParams } from "wouter"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { OrganizationHeader } from "@/components/organization/OrganizationHeader"
import { OrganizationMembers } from "@/components/organization/OrganizationMembers"
import { PackageCard } from "@/components/PackageCard"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useListOrgMembers } from "@/hooks/use-list-org-members"
import { useOrgByGithubHandle } from "@/hooks/use-org-by-github-handle"
import { PackageCardSkeleton } from "@/components/PackageCardSkeleton"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Box } from "lucide-react"
import type { PublicOrgSchema, Package } from "fake-snippets-api/lib/db/schema"
import { NotFound } from "@/components/NotFound"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"

export const OrganizationProfilePageContent = ({
  org,
}: { org: PublicOrgSchema }) => {
  const baseUrl = useApiBaseUrl()
  const session = useGlobalStore((s) => s.session)
  const axios = useAxios()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("packages")
  const [filter, setFilter] = useState("most-recent")

  const isCurrentUserOrganization = session?.account_id === org.owner_account_id

  const ownerGithubHandle = org.name || null

  const { data: orgPackages, isLoading: isLoadingOrgPackages } =
    useQuery<Package[]>(
      ["organizationPackages", org.org_id],
      async () => {
        const response = await axios.post(`/packages/list`, {
          ...(ownerGithubHandle
            ? { owner_github_username: ownerGithubHandle }
            : {}),
          owner_org_id: org.org_id,
        })
        return response.data.packages
      },
      {
        enabled: Boolean(org.org_id || ownerGithubHandle),
        refetchOnWindowFocus: false,
      },
    )

  const filteredPackages = orgPackages
    ?.filter((pkg) => {
      return (
        !searchQuery ||
        pkg.unscoped_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim())
      )
    })
    ?.sort((a, b) => {
      switch (filter) {
        case "most-recent":
          return b.updated_at.localeCompare(a.updated_at)
        case "least-recent":
          return a.updated_at.localeCompare(b.updated_at)
        case "most-starred":
          return (b.star_count || 0) - (a.star_count || 0)
        case "a-z":
          return a.unscoped_name.localeCompare(b.unscoped_name)
        case "z-a":
          return b.unscoped_name.localeCompare(a.unscoped_name)
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen">
      <Header />

      <OrganizationHeader
        organization={org}
        isCurrentUserOrganization={isCurrentUserOrganization}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="w-full">
          <div className="w-full">
            <Tabs
              defaultValue="packages"
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger
                  value="packages"
                  className="flex items-center gap-2"
                >
                  Packages
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="flex items-center gap-2"
                >
                  Members
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === "packages" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Input
                    type="text"
                    placeholder="Search packages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-recent">Most Recent</SelectItem>
                      <SelectItem value="least-recent">Least Recent</SelectItem>
                      <SelectItem value="most-starred">Most Starred</SelectItem>
                      <SelectItem value="a-z">A-Z</SelectItem>
                      <SelectItem value="z-a">Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingOrgPackages ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <PackageCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPackages?.length !== 0 ? (
                      filteredPackages?.map((pkg) => (
                        <PackageCard
                          key={pkg.package_id}
                          pkg={pkg}
                          baseUrl={baseUrl}
                          showOwner={false}
                          isCurrentUserPackage={isCurrentUserOrganization}
                        />
                      ))
                    ) : (
                      <div className="col-span-full flex justify-center">
                        <div className="flex flex-col items-center py-20 text-gray-500">
                          <Box className="mb-2" size={24} />
                          <span className="text-lg font-medium">
                            {searchQuery.trim()
                              ? `No packages matching '${searchQuery.trim()}'`
                              : "No packages available"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "members" && (
              <div>
                <OrganizationMembers orgId={org.org_id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export const OrganizationProfilePage = () => {
  const { username } = useParams()
  const { data: organization } = useOrgByGithubHandle(username || null)

  if (!organization) {
    return <NotFound />
  }

  return <OrganizationProfilePageContent org={organization} />
}
