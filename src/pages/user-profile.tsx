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
import { MoreVertical, Trash2 } from "lucide-react"
import { useConfirmDeleteSnippetDialog } from "@/components/dialogs/confirm-delete-snippet-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { OptimizedImage } from "@/components/OptimizedImage"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { TypeBadge } from "@/components/TypeBadge"

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
  const apiBaseUrl = useSnippetsBaseApiUrl()

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
                  <Card className="hover:shadow-md transition-all duration-200 hover:border-gray-300 h-full group relative">
                    {isCurrentUserProfile && (
                      <div className="absolute right-2 top-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-xs text-red-600"
                              onClick={(e) => handleDeleteClick(e, snippet)}
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete Snippet
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-black rounded-md overflow-hidden shrink-0">
                          <OptimizedImage
                            src={`${apiBaseUrl}/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.svg`}
                            alt="PCB preview"
                            className="w-full h-full object-contain p-2 scale-[3] rotate-45 hover:scale-[3.5] transition-transform"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {snippet.unscoped_name}
                                </h3>
                                {snippet.is_private && (
                                  <LockClosedIcon className="w-3.5 h-3.5 shrink-0 text-gray-600" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center text-gray-600 shrink-0 mr-8">
                              <StarIcon className="w-3.5 h-3.5 mr-0.5" />
                              <span className="text-xs tabular-nums">
                                {snippet.star_count || 0}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 mb-2">
                            An interactive, runnable TypeScript val
                          </p>
                          <div className="flex items-center justify-between">
                            <TypeBadge
                              type={snippet.snippet_type}
                              className="text-[11px] px-1.5 py-0.5 font-medium uppercase tracking-wide"
                            />
                            <time className="text-xs text-gray-500">
                              Last updated:{" "}
                              {new Date(
                                snippet.updated_at,
                              ).toLocaleDateString()}
                            </time>
                          </div>
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
                                onClick={(e) => handleDeleteClick(e, snippet)}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete Snippet
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
