import React from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link } from "wouter"
import { StarFilledIcon } from "@radix-ui/react-icons"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { OptimizedImage } from "@/components/OptimizedImage"
import { Star } from "lucide-react"

const TrendingPage: React.FC = () => {
  const axios = useAxios()
  const apiBaseUrl = useSnippetsBaseApiUrl()

  const {
    data: snippets,
    isLoading,
    error,
  } = useQuery<Snippet[]>("trendingSnippets", async () => {
    const response = await axios.get("/snippets/list_trending")
    return response.data.snippets
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Trending Snippets
          </h1>
          <p className="text-gray-600">
            Discover the most popular snippets from the last 7 days
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-64 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Snippets
            </h3>
            <p>
              We couldn't load the trending snippets. Please try again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {snippets?.map((snippet) => (
              <Link
                key={snippet.snippet_id}
                href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col">
                  <div className="p-4 pb-2">
                    <h3 className="font-medium text-blue-600 mb-1 truncate group-hover:underline">
                      {snippet.owner_name}/{snippet.unscoped_name}
                    </h3>
                  </div>
                  <div className="flex-grow bg-black p-2 relative overflow-hidden">
                    <OptimizedImage
                      src={`${apiBaseUrl}/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.svg`}
                      alt="PCB preview"
                      className="w-full h-full object-contain scale-[3] rotate-45 group-hover:scale-[3.5] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 pt-2 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      <span>{snippet.star_count || 0} stars</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(snippet.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default TrendingPage
