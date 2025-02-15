import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Star } from "lucide-react"
import { Link } from "wouter"
import { Snippet } from "fake-snippets-api/lib/db/schema"

interface SnippetListProps {
  title: string
  snippets?: Snippet[]
  showAll?: boolean
  onToggleShowAll?: () => void
  maxItems?: number
}

export const SnippetList = ({
  title,
  snippets = [],
  showAll = false,
  onToggleShowAll,
  maxItems = 5,
}: SnippetListProps) => {
  const displayedSnippets = showAll ? snippets : snippets.slice(0, maxItems)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700">{title}</h2>
        {snippets.length > maxItems && onToggleShowAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleShowAll}
            className="text-blue-600 hover:text-blue-700 hover:bg-transparent"
          >
            {showAll ? (
              <>
                Show less <ChevronUp className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
      <div className="border-b border-gray-200" />
      {snippets && (
        <ul className="space-y-1 mt-2">
          {displayedSnippets.map((snippet) => (
            <li key={snippet.snippet_id}>
              <div className="flex items-center">
                <Link
                  href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {snippet.owner_name}/{snippet.unscoped_name}
                </Link>
                {snippet.star_count > 0 && (
                  <span className="ml-2 text-gray-500 text-xs flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    {snippet.star_count}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
