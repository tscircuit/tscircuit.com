import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { StarFilledIcon } from "@radix-ui/react-icons"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useEffect, useRef, useState } from "react"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { OptimizedImage } from "./OptimizedImage"
import { Link } from "wouter"

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

  if (!trendingSnippets?.length) return null

  return (
    <div className="w-full bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Trending Snippets</h2>
      </div>
      <div
        className="flex gap-6 overflow-x-hidden relative"
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
                <div className="flex-shrink-0 w-[200px] bg-white p-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="font-medium text-blue-600 mb-1 truncate text-sm">
                    {snippet.owner_name}/{snippet.unscoped_name}
                  </div>
                  <div className="mb-2 h-24 w-full bg-black rounded overflow-hidden">
                    <OptimizedImage
                      src={`${apiBaseUrl}/snippets/images/${snippet.owner_name}/${snippet.unscoped_name}/pcb.svg`}
                      alt="PCB preview"
                      className="w-full h-full object-contain p-2 scale-[3] rotate-45 hover:scale-[3.5] transition-transform"
                    />
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <StarFilledIcon className="w-3 h-3 mr-1" />
                    {snippet.star_count || 0} stars
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
