import { useAxios } from "@/hooks/useAxios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useToast } from "@/hooks/useToast"
import type { Snippet } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"

export const useForkSnippetMutation = ({
  snippet,
  currentCode,
  onSuccess,
}: {
  snippet: Snippet
  currentCode?: string
  onSuccess?: (forkedSnippet: Snippet) => void
}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const { toast } = useToast()

  return useMutation(
    ["createForkSnippet"],
    async () => {
      if (!session) throw new Error("No session")
      if (!snippet) throw new Error("No snippet to fork")

      const { data } = await axios.post("/snippets/create", {
        unscoped_name: snippet.unscoped_name,
        snippet_type: snippet.snippet_type,
        owner_name: session.github_username,
        code: currentCode ?? snippet.code, // Use currentCode if provided, fall back to snippet.code
      })
      return data.snippet
    },
    {
      onSuccess: (forkedSnippet: Snippet) => {
        toast({
          title: "Forked snippet",
          description:
            "You have successfully forked the snippet. Redirecting...",
        })
        onSuccess?.(forkedSnippet)
      },
      onError: (error: any) => {
        console.error("Error forking snippet:", error)
        const message = error?.data?.error?.message
        toast({
          title: "Error",
          description: message || "Failed to fork snippet. Please try again.",
          variant: "destructive",
        })
      },
    },
  )
}
