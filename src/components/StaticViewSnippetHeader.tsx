import React from "react"
import { TypeBadge } from "@/components/TypeBadge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Eye, GitFork, Star } from "lucide-react"
import { Link } from "wouter"

export default function StaticViewSnippetHeader({
  author,
  snippetName,
}: {
  author: string
  snippetName: string
}) {
  const snippet_data = {
    owner_name: author,
    unscoped_name: snippetName,
    //sample values
    snippet_type: "board",
    is_starred: false,
    star_count: 0,
  }

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-2">
            <Link
              href={`/${snippet_data.owner_name}`}
              className="text-blue-600"
            >
              {snippet_data.owner_name}
            </Link>
            <span className="px-1 text-gray-500">/</span>
            <Link
              className="text-blue-600"
              href={`/${snippet_data.owner_name}/${snippet_data.unscoped_name}`}
            >
              {snippet_data.unscoped_name}
            </Link>
          </h1>
          {snippet_data.snippet_type && (
            <TypeBadge type={snippet_data.snippet_type} />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            aria-label="Loading placeholder"
            className="loading-placeholder"
          >
            <Star className="w-4 h-4 mr-2" />
            Star
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            aria-label="Loading placeholder"
            className="loading-placeholder"
          >
            <GitFork className="w-4 h-4 mr-2" />
            Fork
          </Button>
        </div>
      </div>
    </header>
  )
}
