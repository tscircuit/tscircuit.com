import React, { useState } from "react"
import { useParams } from "wouter"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { GitHubLogoIcon, StarIcon, LockClosedIcon } from "@radix-ui/react-icons"
import { Input } from "@/components/ui/input"
import { useGlobalStore } from "@/hooks/use-global-store"
import { GlobeIcon, MoreVertical, PencilIcon, Trash2 } from "lucide-react"
import { useConfirmDeleteSnippetDialog } from "@/components/dialogs/confirm-delete-snippet-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OptimizedImage } from "@/components/OptimizedImage"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { TypeBadge } from "@/components/TypeBadge"
import { format } from "timeago.js"

export const UserProfilePage = () => {
  const { username } = useParams()
  const axios = useAxios()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const session = useGlobalStore((s) => s.session)
  const isCurrentUserProfile = username === session?.github_username
  const { Dialog: DeleteDialog, openDialog: openDeleteDialog } =
    useConfirmDeleteSnippetDialog()
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
        enabled: activeTab === "starred", // Only fetch when starred tab is active
      },
    )

  const baseUrl = useSnippetsBaseApiUrl()

  const snippetsToShow =
    activeTab === "starred" ? starredSnippets : userSnippets
  const isLoading =
    activeTab === "starred" ? isLoadingStarredSnippets : isLoadingUserSnippets

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
        <h1 className="text-3xl font-bold mb-6">
          {isCurrentUserProfile ? "My Profile" : `${username}'s Profile`}
        </h1>
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
            <TabsTrigger value="all">Snippets</TabsTrigger>
            <TabsTrigger value="starred">Starred Snippets</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        {isLoading ? (
          <div>
            {activeTab === "starred"
              ? "Loading starred snippets..."
              : "Loading user snippets..."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSnippets
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
                          src={`${baseUrl}/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.svg`}
                          alt={`${snippet.owner_name}'s profile`}
                          className="object-cover h-full w-full transition-transform duration-300 -rotate-45 hover:rotate-0 hover:scale-110 scale-150"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h2 className="text-md font-semibold text-gray-900 truncate">
                            {snippet.unscoped_name}
                          </h2>
                          <div className="flex items-center gap-2">
                            <TypeBadge
                              type={snippet.snippet_type}
                              className="mr-1"
                            />
                            <div className="flex items-center gap-1 text-gray-600">
                              <StarIcon className="w-4 h-4 pt-[2.5px]" />
                              <span className="text-[15.5px]">
                                {snippet.star_count || 0}
                              </span>
                            </div>
                            {isCurrentUserProfile && activeTab === "all" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    className="text-xs text-red-600"
                                    onClick={(e) =>
                                      handleDeleteClick(e, snippet)
                                    }
                                  >
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Delete Snippet
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-[3px] truncate max-w-xs -mt-[1px]">
                          {snippet.description ? snippet.description : " "}
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
                            <span>{format(snippet.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
      {snippetToDelete && (
        <DeleteDialog
          snippetId={snippetToDelete.snippet_id}
          snippetName={snippetToDelete.unscoped_name}
        />
      )}
      <Footer />
    </div>
  )
}
