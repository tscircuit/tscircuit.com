import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { PackageCard } from "@/components/PackageCard"
import { useConfirmDeletePackageDialog } from "@/components/dialogs/confirm-delete-package-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import type { Package } from "fake-snippets-api/lib/db/schema"
import type React from "react"
import { useState } from "react"
import { useQuery } from "react-query"
import { useParams } from "wouter"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Box, Star } from "lucide-react"
import { PackageCardSkeleton } from "@/components/PackageCardSkeleton"

export const UserProfilePage = () => {
  const { username } = useParams()
  const axios = useAxios()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [filter, setFilter] = useState("most-recent") // Changed default from "newest" to "most-recent"
  const session = useGlobalStore((s) => s.session)
  const isCurrentUserProfile = username === session?.github_username
  const { Dialog: DeleteDialog, openDialog: openDeleteDialog } =
    useConfirmDeletePackageDialog()
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null)

  const {
    data: userPackages,
    isLoading: isLoadingUserPackages,
    refetch: refetchUserPackages,
  } = useQuery<Package[]>(["userPackages", username], async () => {
    const response = await axios.post(`/packages/list`, {
      owner_github_username: username,
    })
    return response.data.packages
  })

  const { data: starredPackages, isLoading: isLoadingStarredPackages } =
    useQuery<Package[]>(
      ["starredPackages", username],
      async () => {
        const response = await axios.post(`/packages/list`, {
          starred_by: username,
        })
        return response.data.packages
      },
      {
        enabled: activeTab === "starred",
      },
    )

  const baseUrl = useSnippetsBaseApiUrl()

  const packagesToShow =
    activeTab === "starred" ? starredPackages : userPackages
  const isLoading =
    activeTab === "starred" ? isLoadingStarredPackages : isLoadingUserPackages

  const filteredPackages = packagesToShow
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

  const handleDeleteClick = (e: React.MouseEvent, pkg: Package) => {
    e.preventDefault() // Prevent navigation
    setPackageToDelete(pkg)
    openDeleteDialog()
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://github.com/${username}.png`} />
            <AvatarFallback>{username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              {isCurrentUserProfile ? "My Profile" : `${username}'s Profile`}
            </h1>
            <div className="text-gray-600 mt-1">
              {userPackages?.length || 0} packages
            </div>
          </div>
        </div>
        <div className="mb-6">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            <Button variant="outline">
              <GitHubLogoIcon className="mr-2" />
              View GitHub Profile
            </Button>
          </a>
        </div>
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">Packages</TabsTrigger>
            <TabsTrigger value="starred">Starred Packages</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-4 mb-4">
          <Input
            type="text"
            placeholder="Searching User Packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
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
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  showOwner={activeTab === "starred"}
                  isCurrentUserPackage={
                    isCurrentUserProfile && activeTab === "all"
                  }
                  onDeleteClick={handleDeleteClick}
                />
              ))
            ) : (
              <div className="col-span-full flex justify-center">
                <div className="flex flex-col items-center py-12 text-gray-500">
                  {activeTab === "starred" ? (
                    <>
                      <Star className="mb-2" size={24} />
                      <span className="text-lg font-medium">
                        {searchQuery.trim()
                          ? `No starred packages matching '${searchQuery.trim()}'`
                          : "No starred packages"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Box className="mb-2" size={24} />
                      <span className="text-lg font-medium">
                        {searchQuery.trim()
                          ? `No packages matching '${searchQuery.trim()}'`
                          : "No packages available"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {packageToDelete && (
        <DeleteDialog
          packageId={packageToDelete.package_id}
          packageName={packageToDelete.unscoped_name}
          refetchUserPackages={refetchUserPackages}
        />
      )}
      <Footer />
    </div>
  )
}
