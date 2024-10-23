import { Link } from "wouter"
import { Star } from "lucide-react"

export const SnippetLink = ({
  snippet,
}: {
  snippet: {
    owner_name: string
    name: string
    unscoped_name: string
    star_count?: number
  }
}) => {
  return (
    <>
      <Link
        className="text-blue-500 font-semibold hover:underline"
        href={`/${snippet.owner_name}`}
      >
        {snippet.owner_name}
      </Link>
      <span className="px-0.5 text-gray-500">/</span>
      <Link
        className="text-blue-500  font-semibold hover:underline"
        href={`/${snippet.name}`}
      >
        {snippet.unscoped_name}
      </Link>
      {snippet.star_count !== undefined && (
        <span className="ml-2 text-gray-500 text-xs flex items-center">
          <Star className="w-3 h-3 mr-1" />
          {snippet.star_count}
        </span>
      )}
    </>
  )
}
