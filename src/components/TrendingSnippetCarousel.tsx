import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { StarFilledIcon } from "@radix-ui/react-icons"
import { Link } from "wouter"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useEffect, useRef, useState } from "react"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { OptimizedImage } from "./OptimizedImage"

export const TrendingSnippetCarousel = () => {
  const axios = useAxios()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const apiBaseUrl = useSnippetsBaseApiUrl()

  const { data: trendingSnippets } = useQuery<Snippet[]>(
    "trendingSnippets",
    async () => {
      const response = await axios.get("/snippets/list_trending")
      return response.data.snippets
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  )

  return (
    <div className="w-full bg-gray-50 py-8 min-h-[280px] dark:bg-gray-800">
      {trendingSnippets?.length ? (
        <>
          <div className="container px-4 mx-auto">
            <h2 className="mb-6 text-2xl font-semibold dark:text-gray-100">
              Trending Snippets
            </h2>
          </div>
          <div
            className="relative flex gap-6 overflow-x-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              ref={scrollRef}
              className="flex gap-6 transition-transform duration-1000 animate-carousel-left"
            >
              {[...(trendingSnippets ?? []), ...(trendingSnippets ?? [])].map(
                (snippet, i) => (
                  <Link
                    key={`${snippet.snippet_id}-${i}`}
                    href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
                  >
                    <div className="flex-shrink-0 w-[200px] bg-white p-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500">
                      <div className="mb-1 text-sm font-medium text-blue-600 truncate dark:text-blue-400">
                        {snippet.owner_name}/{snippet.unscoped_name}
                      </div>
                      <div className="w-full h-24 mb-2 overflow-hidden bg-black rounded">
                        <OptimizedImage
                          src={`${apiBaseUrl}/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.svg`}
                          alt="PCB preview"
                          className="w-full h-full object-contain p-2 scale-[3] rotate-45 hover:scale-[3.5] transition-transform"
                        />
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <StarFilledIcon className="w-3 h-3 mr-1" />
                        {snippet.star_count || 0} stars
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
