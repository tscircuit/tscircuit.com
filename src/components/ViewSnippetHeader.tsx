import { Button } from "@/components/ui/button"
import { useCurrentSnippet } from "@/hooks/use-current-snippet"
import { ChevronLeft, Star, Eye, GitFork } from "lucide-react"
import { Link } from "wouter"
import { TypeBadge } from "@/components/TypeBadge"
import { useAxios } from "@/hooks/use-axios"
import { toast, useToast } from "@/hooks/use-toast"
import { useQueryClient } from "react-query"

export default function ViewSnippetHeader() {
  const { snippet } = useCurrentSnippet()
  const axios = useAxios()
  const qc = useQueryClient()
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-2">
            <Link href={`/${snippet?.owner_name}`} className="text-blue-600">
              {snippet?.owner_name}
            </Link>
            <span className="px-1 text-gray-500">/</span>
            <Link
              className="text-blue-600"
              href={`/${snippet?.owner_name}/${snippet?.unscoped_name}`}
            >
              {snippet?.unscoped_name}
            </Link>
          </h1>
          {snippet?.snippet_type && <TypeBadge type={snippet.snippet_type} />}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await axios.post("/snippets/add_star", {
                  snippet_id: snippet!.snippet_id,
                })
                toast({
                  title: "Starred!",
                  description: "You've starred this snippet",
                })
                qc.invalidateQueries(["snippets", snippet!.snippet_id])
              } catch (error: any) {
                if (error?.status === 400) {
                  toast({
                    title: "Already starred",
                    description: "You've already starred this snippet",
                    variant: "destructive",
                  })
                } else {
                  toast({
                    title: "Error",
                    description: "Failed to star snippet",
                    variant: "destructive",
                  })
                }
              }
            }}
          >
            <Star className="w-4 h-4 mr-2" />
            Star {snippet!.star_count > 0 && `(${snippet!.star_count})`}
          </Button>
          {/* <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Watch
          </Button> */}
          <Button variant="outline" size="sm">
            <GitFork className="w-4 h-4 mr-2" />
            Fork
          </Button>
        </div>
      </div>
      {/* <div className="mt-4 flex justify-end items-center text-sm text-gray-500">
        <span className="mr-4">Last updated: 2 days ago</span>
        <span>Version: 1.0.0</span>
      </div> */}
    </header>
  )
}
