import { TypeBadge } from "@/components/TypeBadge"
import { Button } from "@/components/ui/button"
import { useAxios } from "@/hooks/use-axios"
import { useCurrentSnippet } from "@/hooks/use-current-snippet"
import { useGlobalStore } from "@/hooks/use-global-store"
import { toast, useToast } from "@/hooks/use-toast"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { ChevronLeft, Eye, GitFork, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { Link } from "wouter"
import { navigate } from "wouter/use-browser-location"

export default function ViewSnippetHeader() {
  const { snippet } = useCurrentSnippet()
  const axios = useAxios()
  const qc = useQueryClient()
  const session = useGlobalStore((s) => s.session)
  const [isStarred, setIsStarred] = useState(snippet?.is_starred || false)

  const useForkSnippetMutation = ({
    snippet,
    onSuccess,
  }: {
    snippet: Snippet
    onSuccess?: (forkedSnippet: Snippet) => void
  }) => {
    const axios = useAxios()
    const session = useGlobalStore((s) => s.session)

    return useMutation(
      ["createForkSnippet"],
      async () => {
        if (!session) throw new Error("No session")
        if (!snippet) throw new Error("No snippet to fork")

        const { data } = await axios.post("/snippets/create", {
          unscoped_name: snippet.unscoped_name,
          snippet_type: snippet.snippet_type,
          owner_name: session.github_username,
          code: snippet.code,
        })

        if (!data.ok) {
          throw new Error(
            data.error || "Unknown error occurred while forking snippet.",
          )
        }

        return data.snippet
      },
      {
        onSuccess: (forkedSnippet: Snippet) => {
          toast({
            title: `Forked snippet`,
            description: `You have successfully forked the snippet. Redirecting...`,
          })
          onSuccess?.(forkedSnippet)
        },
        onError: (error: any) => {
          // Check if the error message contains 'already exists'
          if (error.message?.includes("already forked")) {
            toast({
              title: "Snippet already exists",
              description: error.message,
              variant: "destructive", // You can style this variant differently
            })
          } else {
            toast({
              title: "Error",
              description: "Failed to fork snippet. Please try again.",
              variant: "destructive", // Use destructive variant for errors
            })
          }
          console.error("Error forking snippet:", error)
        },
      },
    )
  }

  const { mutate: forkSnippet, isLoading: isForking } = useForkSnippetMutation({
    snippet: snippet!,
    onSuccess: (forkedSnippet) => {
      navigate("/editor?snippet_id=" + forkedSnippet.snippet_id)
    },
  })
  const handleStarClick = async () => {
    try {
      if (isStarred) {
        await axios.post("/snippets/remove_star", {
          snippet_id: snippet!.snippet_id,
        })
        setIsStarred(false)
        toast({
          title: "Unstarred!",
          description: "You've unstarred this snippet",
        })
      } else {
        await axios.post("/snippets/add_star", {
          snippet_id: snippet!.snippet_id,
        })
        setIsStarred(true)
        toast({
          title: "Starred!",
          description: "You've starred this snippet",
        })
      }
      qc.invalidateQueries(["snippets", snippet!.snippet_id])
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${isStarred ? "unstar" : "star"} snippet`,
        variant: "destructive",
      })
    }
  }

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
          <Button variant="outline" size="sm" onClick={handleStarClick}>
            <Star
              className={`w-4 h-4 mr-2 ${isStarred ? "fill-yellow-500 text-yellow-500" : ""}`}
            />
            {isStarred ? "Starred" : "Star"}
            {snippet!.star_count > 0 && (
              <span className="ml-1.5 bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.5 text-xs font-medium">
                {snippet!.star_count}
              </span>
            )}
          </Button>
          {/* <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Watch
          </Button> */}

          <Button variant="outline" size="sm" onClick={() => forkSnippet()}>
            <GitFork className="w-4 h-4 mr-2" />
            {snippet?.owner_name === session?.github_username ? "Save" : "Fork"}
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
