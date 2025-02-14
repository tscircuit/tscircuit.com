import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { Link } from "wouter"
import { CreateNewSnippetWithAiHero } from "@/components/CreateNewSnippetWithAiHero"
import { Edit2, Star, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"
import { SnippetList } from "@/components/SnippetList"

export const DashboardPage = () => {
  const axios = useAxios()

  const currentUser = useGlobalStore((s) => s.session?.github_username)
  const [showAllTrending, setShowAllTrending] = useState(false)
  const [showAllNewest, setShowAllNewest] = useState(false)

  const {
    data: mySnippets,
    isLoading,
    error,
  } = useQuery<Snippet[]>("userSnippets", async () => {
    const response = await axios.get(`/snippets/list?owner_name=${currentUser}`)
    return response.data.snippets.sort(
      (a: any, b: any) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime(),
    )
  })

  const { data: trendingSnippets } = useQuery<Snippet[]>(
    "trendingSnippets",
    async () => {
      const response = await axios.get("/snippets/list_trending")
      return response.data.snippets
    },
  )

  const { data: newestSnippets } = useQuery<Snippet[]>(
    "newestSnippets",
    async () => {
      const response = await axios.get("/snippets/list_newest")
      return response.data.snippets
    },
  )

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex md:flex-row flex-col">
          <div className="md:w-3/4 p-0 md:pr-6">
            <div className="mt-6 mb-4">
              <div className="flex items-center">
                <h2 className="text-sm text-gray-600 whitespace-nowrap">
                  Edit Recent
                </h2>
                <div className="flex gap-2 items-center overflow-x-scroll md:overflow-hidden ">
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
            <CreateNewSnippetWithAiHero />
            <h2 className="text-sm font-bold mb-2 text-gray-700 border-b border-gray-200">
              Your Recent Snippets
            </h2>
            {isLoading && <div>Loading...</div>}
            {mySnippets && (
              <ul className="space-y-1">
                {mySnippets.slice(0, 10).map((snippet) => (
                  <li
                    key={snippet.snippet_id}
                    className="flex items-center justify-between"
                  >
                    <Link
                      href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {snippet.unscoped_name}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(snippet.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {mySnippets && mySnippets.length > 10 && (
              <Link
                href={`/${currentUser}`}
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                View all snippets
              </Link>
            )}
          </div>
          <div className="md:w-1/4">
            <SnippetList
              title="Trending Snippets"
              snippets={trendingSnippets}
              showAll={showAllTrending}
              onToggleShowAll={() => setShowAllTrending(!showAllTrending)}
            />
            <div className="mt-8">
              <SnippetList
                title="Newest Snippets"
                snippets={newestSnippets}
                showAll={showAllNewest}
                onToggleShowAll={() => setShowAllNewest(!showAllNewest)}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
