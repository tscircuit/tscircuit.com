import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { Link } from "wouter"
import { CreateNewSnippetWithAiHero } from "@/components/CreateNewSnippetWithAiHero"
import {
  Edit2,
  Star,
  ChevronDown,
  ChevronUp,
  Key,
  KeyRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"
import { SnippetList } from "@/components/SnippetList"
import { Helmet } from "react-helmet-async"
import { useSignIn } from "@/hooks/use-sign-in"
import { SnippetCard } from "@/components/SnippetCard"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { useConfirmDeletePackageDialog } from "@/components/dialogs/confirm-delete-package-dialog"

export const DashboardPage = () => {
  const axios = useAxios()

  const currentUser = useGlobalStore((s) => s.session?.github_username)
  const isLoggedIn = Boolean(currentUser)
  const signIn = useSignIn()

  const [showAllTrending, setShowAllTrending] = useState(false)
  const [showAllLatest, setShowAllLatest] = useState(false)
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null)
  const { Dialog: DeleteDialog, openDialog: openDeleteDialog } =
    useConfirmDeletePackageDialog()

  const {
    data: mySnippets,
    isLoading,
    error,
  } = useQuery<Snippet[]>(
    "userSnippets",
    async () => {
      const response = await axios.get(
        `/snippets/list?owner_name=${currentUser}`,
      )
      return response.data.snippets.sort(
        (a: any, b: any) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime(),
      )
    },
    {
      enabled: isLoggedIn,
    },
  )

  const { data: trendingSnippets } = useQuery<Snippet[]>(
    "trendingSnippets",
    async () => {
      const response = await axios.get("/snippets/list_trending")
      return response.data.snippets
    },
  )

  const { data: latestSnippets } = useQuery<Snippet[]>(
    "latestSnippets",
    async () => {
      const response = await axios.get("/snippets/list_latest")
      return response.data.snippets
    },
  )

  const baseUrl = useSnippetsBaseApiUrl()

  const handleDeleteClick = (e: React.MouseEvent, snippet: Snippet) => {
    e.preventDefault() // Prevent navigation
    setSnippetToDelete(snippet)
    openDeleteDialog()
  }
  return (
    <div>
      <Helmet>
        <title>Dashboard - tscircuit</title>
      </Helmet>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex md:flex-row flex-col">
          <div className="md:w-3/4 p-0 md:pr-6">
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-md p-4 mt-[40px] mb-2 sm:mb-4">
                <div className="p-4 mb-4 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                  <KeyRound className="text-blue-500" size={32} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                  You're not logged in
                </h2>

                <p className="text-gray-600 mb-6 text-center max-w-md text-sm sm:text-base">
                  Log in to access your dashboard and manage your snippets.
                </p>
                <Button onClick={() => signIn()} variant="outline">
                  Log in
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-6 mb-4">
                  <div className="flex items-center">
                    <h2 className="text-sm text-gray-600 whitespace-nowrap">
                      Edit Recent
                    </h2>
                    <div className="flex gap-2 items-center overflow-x-scroll md:overflow-hidden">
                      {mySnippets &&
                        mySnippets.slice(0, 3).map((snippet) => (
                          <div key={snippet.snippet_id}>
                            <PrefetchPageLink
                              href={`/editor?snippet_id=${snippet.snippet_id}`}
                              className="text-blue-600 hover:underline"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-medium"
                              >
                                {snippet.unscoped_name}
                                <Edit2 className="w-3 h-3 ml-2" />
                              </Button>
                            </PrefetchPageLink>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                {/* <CreateNewSnippetWithAiHero/> */}
                <h2 className="text-sm font-bold mb-2 text-gray-700 border-b border-gray-200">
                  Your Recent Packages
                </h2>
                {isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="border p-4 rounded-md animate-pulse"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-slate-200"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                            <div className="flex gap-2">
                              <div className="h-3 bg-slate-200 rounded w-16"></div>
                              <div className="h-3 bg-slate-200 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {mySnippets && mySnippets.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {mySnippets.slice(0, 10).map((snippet) => (
                      <SnippetCard
                        key={snippet.snippet_id}
                        snippet={snippet}
                        baseUrl={baseUrl}
                        isCurrentUserSnippet={
                          snippet.owner_name === currentUser
                        }
                        onDeleteClick={handleDeleteClick}
                      />
                    ))}
                  </div>
                ) : (
                  !isLoading &&
                  mySnippets?.length === 0 && (
                    <span className="font-medium text-sm text-gray-500">
                      No packages found
                    </span>
                  )
                )}
                {mySnippets && mySnippets.length > 10 && (
                  <Link
                    href={`/${currentUser}`}
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View all packages
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="md:w-1/4">
            <SnippetList
              title="Trending Packages"
              snippets={trendingSnippets}
              showAll={showAllTrending}
              onToggleShowAll={() => setShowAllTrending(!showAllTrending)}
            />
            <div className="mt-8">
              <SnippetList
                title="Latest Packages"
                snippets={latestSnippets}
                showAll={showAllLatest}
                onToggleShowAll={() => setShowAllLatest(!showAllLatest)}
              />
            </div>
          </div>
        </div>
        {snippetToDelete && (
          <DeleteDialog
            packageId={snippetToDelete.snippet_id}
            packageName={snippetToDelete.unscoped_name}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}
