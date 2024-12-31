import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { StarFilledIcon } from "@radix-ui/react-icons"
import { Link } from "wouter"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useEffect, useRef, useState } from "react"

export const TrendingSnippetCarousel = () => {
  const axios = useAxios()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const { data: trendingSnippets } = useQuery<Snippet[]>(
    "trendingSnippets",
    async () => {
      const response = await axios.get("/snippets/list_trending")
      return response.data.snippets
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
          {[...(trendingSnippets ?? [])].map((snippet, i) => (
            <Link
              key={`${snippet.snippet_id}-${i}`}
              href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
            >
              <div className="flex-shrink-0 w-[200px] bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="font-medium text-blue-600 mb-1 truncate text-sm">
                  {snippet.owner_name}/{snippet.unscoped_name}
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {snippet.description || "No description provided"}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <StarFilledIcon className="w-3 h-3 mr-1" />
                  {snippet.star_count || 0} stars
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
