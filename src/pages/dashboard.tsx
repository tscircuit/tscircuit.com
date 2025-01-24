import React from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { Link } from "wouter"
import { CreateNewSnippetWithAiHero } from "@/components/CreateNewSnippetWithAiHero"
import { Edit2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"

export const DashboardPage = () => {
  const axios = useAxios()

  const currentUser = useGlobalStore((s) => s.session?.github_username)

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
    <div className="dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col md:flex-row">
          <div className="p-0 md:w-3/4 md:pr-6">
            <div className="mt-6 mb-4">
              <div className="flex items-center">
                <h2 className="text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                  Edit Recent
                </h2>
                <div className="flex items-center gap-2 overflow-x-scroll md:overflow-hidden ">
                  {mySnippets &&
                    mySnippets.slice(0, 3).map((snippet) => (
                      <div key={snippet.snippet_id}>
                        <PrefetchPageLink
                          href={`/editor?snippet_id=${snippet.snippet_id}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
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
            <h2 className="mb-2 text-sm font-bold text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-600">
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
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {snippet.unscoped_name}
                    </Link>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(snippet.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {mySnippets && mySnippets.length > 10 && (
              <Link
                href={`/${currentUser}`}
                className="inline-block mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                View all snippets
              </Link>
            )}
          </div>
          <div className="md:w-1/4">
            <h2 className="mb-2 text-sm font-bold text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-600">
              Trending Snippets
            </h2>
            {trendingSnippets && (
              <ul className="space-y-1">
                {trendingSnippets.map((snippet) => (
                  <li key={snippet.snippet_id}>
                    <div className="flex items-center">
                      <Link
                        href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {snippet.owner_name}/{snippet.unscoped_name}
                      </Link>
                      {snippet.star_count > 0 && (
                        <span className="flex items-center ml-2 text-xs text-gray-500 dark:text-gray-400">
                          <Star className="w-3 h-3 mr-1" />
                          {snippet.star_count}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <h2 className="mt-8 mb-2 text-sm font-bold text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-600">
              Newest Snippets
            </h2>
            {newestSnippets && (
              <ul className="space-y-1">
                {newestSnippets.map((snippet) => (
                  <li key={snippet.snippet_id}>
                    <Link
                      href={`/${snippet.name}`}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {snippet.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
