import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { SnippetCard } from "@/components/SnippetCard"
import { useConfirmDeletePackageDialog } from "@/components/dialogs/confirm-delete-package-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import type { Snippet } from "fake-snippets-api/lib/db/schema"
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
import { Star } from "lucide-react"

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
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null)

  const { data: userSnippets, isLoading: isLoadingUserSnippets } = useQuery<
    Snippet[]
  >(["userSnippets", username], async () => {
    const response = await axios.get(`/snippets/list?owner_name=${username}`)
    return response.data.snippets
  })

  const { data: starredSnippets, isLoading: isLoadingStarredSnippets } =
    useQuery<Snippet[]>(
      ["starredSnippets", username],
      async () => {
        const response = await axios.get(
          `/snippets/list?starred_by=${username}`,
        )
        return response.data.snippets
      },
      {
        enabled: activeTab === "starred",
      },
    )

  const baseUrl = useSnippetsBaseApiUrl()

  const snippetsToShow =
    activeTab === "starred" ? starredSnippets : userSnippets
  const isLoading =
    activeTab === "starred" ? isLoadingStarredSnippets : isLoadingUserSnippets

  const filteredSnippets = snippetsToShow
    ?.filter((snippet) => {
      return (
        !searchQuery ||
        snippet.unscoped_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim())
      )
    })
    ?.sort((a, b) => {
      switch (filter) {
        case "most-recent":
          if (activeTab === "starred") {
            const aTime = a.star_timestamp || a.updated_at
            const bTime = b.star_timestamp || b.updated_at
            return bTime.localeCompare(aTime)
          }
          return b.updated_at.localeCompare(a.updated_at)
        case "least-recent":
          if (activeTab === "starred") {
            return (a.star_timestamp || a.updated_at).localeCompare(
              b.star_timestamp || b.updated_at,
            )
          }
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

  const handleDeleteClick = (e: React.MouseEvent, snippet: Snippet) => {
    e.preventDefault() // Prevent navigation
    setSnippetToDelete(snippet)
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
              {userSnippets?.length || 0} packages
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
          <div>
            {activeTab === "starred"
              ? "Loading Starred Packages..."
              : "Loading User Packages..."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnippets?.length !== 0 ? (
              filteredSnippets?.map((snippet) => (
                <SnippetCard
                  key={snippet.snippet_id}
                  snippet={snippet}
                  baseUrl={baseUrl}
                  showOwner={activeTab === "starred"}
                  isCurrentUserSnippet={
                    isCurrentUserProfile && activeTab === "all"
                  }
                  onDeleteClick={handleDeleteClick}
                />
              ))
            ) : (
              <div className="col-span-full flex justify-center">
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <Star />
                  <span className="text-lg font-medium">
                    No starred packages
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {snippetToDelete && (
        <DeleteDialog
          packageId={snippetToDelete.snippet_id}
          packageName={snippetToDelete.unscoped_name}
        />
      )}
      <Footer />
    </div>
  )
}
