import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"
import { useAxios } from "./use-axios"
import { useGlobalStore } from "./use-global-store"
import { useUrlParams } from "./use-url-params"

export const useCreateSnippetMutation = ({
  onSuccess,
}: { onSuccess?: (snippet: Snippet) => void } = {}) => {
  const urlParams = useUrlParams()
  const templateName = urlParams.template
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  return useMutation(
    ["createSnippet"],
    async ({
      code,
      circuit_json,
      pcb_route_cache,
    }: { code?: string; circuit_json?: any[]; pcb_route_cache?: any } = {}) => {
      if (!session) throw new Error("No session")
      const template =
        typeof code === "string"
          ? {
              code,
              type:
                urlParams.type ||
                (code.includes("<board") ? "board" : "package"),
            }
          : getSnippetTemplate(templateName)
      const {
        data: { snippet },
      } = await axios.post("/snippets/create", {
        code: template.code,
        snippet_type: template.type ?? "board",
        owner_name: session?.github_username,
        circuit_json,
        pcb_route_cache,
      })
      return snippet
    },
    {
      onSuccess: (snippet: any) => {
        const url = new URL(window.location.href)
        url.searchParams.set("snippet_id", snippet.snippet_id)
        url.searchParams.delete("template")
        url.searchParams.delete("should_create_snippet")
        window.history.pushState({}, "", url.toString())
        onSuccess?.(snippet)
        window.dispatchEvent(new Event("popstate"))
      },
      onError: (error: any) => {
        console.error("Error creating snippet:", error)
      },
    },
  )
}
