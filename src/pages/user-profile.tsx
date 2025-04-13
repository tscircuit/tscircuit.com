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

export const UserProfilePage = () => {
  const { username } = useParams()
  const axios = useAxios()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const session = useGlobalStore((s) => s.session)
  const isCurrentUserProfile = username === session?.github_username
  const { Dialog: DeleteDialog, openDialog: openDeleteDialog } =
    useConfirmDeletePackageDialog()
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null)

  const { data: userPackages, isLoading: isLoadingUserPackages } = useQuery<
    Snippet[]
  >(["userPackages", username], async () => {
    const response = await axios.get(`/packages/list?owner_name=${username}`)
    return response.data.packages
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
        enabled: activeTab === "starred", // Only fetch when starred tab is active
      },
    )

  const baseUrl = useSnippetsBaseApiUrl()

  const snippetsToShow =
    activeTab === "starred" ? starredSnippets : userPackages
  const isLoading =
    activeTab === "starred" ? isLoadingStarredSnippets : isLoadingUserPackages

  const filteredSnippets = snippetsToShow?.filter((snippet) => {
    return (
      !searchQuery ||
      snippet.unscoped_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
        <Input
          type="text"
          placeholder="Searching User Packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        {isLoading ? (
          <div>
            {activeTab === "starred"
              ? "Loading Starred Packages..."
              : "Loading User Packages..."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnippets
              ?.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
              ?.map((snippet) => (
                <SnippetCard
                  // TODO
                  key={
                    (snippet as any).creator_account_id ?? snippet.snippet_id
                  }
                  snippet={snippet}
                  baseUrl={baseUrl}
                  showOwner={activeTab === "starred"}
                  isCurrentUserSnippet={
                    isCurrentUserProfile && activeTab === "all"
                  }
                  onDeleteClick={handleDeleteClick}
                />
              ))}
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
