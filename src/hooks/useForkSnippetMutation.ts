import { useMutation } from "react-query"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { Package, Snippet } from "fake-snippets-api/lib/db/schema"

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
          title: `Forked snippet`,
          description: `You have successfully forked the snippet. Redirecting...`,
        })
        onSuccess?.(forkedSnippet)
      },
      onError: (error: any) => {
        console.error("Error forking snippet:", error)
        toast({
          title: "Error",
          description: "Failed to fork snippet. Please try again.",
          variant: "destructive",
        })
      },
    },
  )
}
export const usePackageForkSnippetMutation = ({
  pkg,
  currentCode,
  onSuccess,
}: {
  pkg: Package
  currentCode?: string
  onSuccess?: (forkedSnippet: Package) => void
}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const { toast } = useToast()

  return useMutation(
    ["createForkSnippet"],
    async () => {
      if (!session) throw new Error("No session")
      if (!pkg) throw new Error("No package to fork")

      const { data } = await axios.post("/packages/fork", {
        package_id: pkg?.package_id,
      })
      return data.package
    },
    {
      onSuccess: (forkedPkg: Package) => {
        toast({
          title: `Forked Package`,
          description: `You have successfully forked the package. Redirecting...`,
        })
        onSuccess?.(forkedPkg)
      },
      onError: (error: any) => {
        console.error("Error forking package:", error)
        toast({
          title: "Error",
          description: "Failed to fork package. Please try again.",
          variant: "destructive",
        })
      },
    },
  )
}
