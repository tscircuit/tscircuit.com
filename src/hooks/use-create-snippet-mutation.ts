import { gzipSync, strToU8 } from "fflate"
import { bytesToBase64 } from "@/lib/bytesToBase64"
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
      manual_edits_json_content,
      is_private,
    }: {
      code?: string
      circuit_json?: any[]
      manual_edits_json_content?: string
      is_private?: boolean
    } = {}) => {
      if (!session) throw new Error("No session")
      const template =
        typeof code === "string"
          ? {
              fsMap: { "index.tsx": code },
              type:
                urlParams.type ||
                (code.includes("<board") ? "board" : "package"),
            }
          : getSnippetTemplate(templateName)
      const {
        data: { snippet },
      } = await axios.post("/snippets/create", {
        code: template.fsMap["index.tsx"],
        snippet_type: template.type ?? "board",
        manual_edits_json_content,
        owner_name: session?.github_username,
        circuit_json,
        is_private,
      })
      const imports = Object.entries(template.fsMap)
        .filter(([path]) => path !== "index.tsx")
        .map(([file_path, content_text]) => ({ file_path, content_text }))
      if (imports.length) {
        const archive = gzipSync(strToU8(JSON.stringify({ files: imports })))
        await axios.post("/package_files/upload_archive", {
          package_release_id: snippet.package_release_id,
          archive_base64: bytesToBase64(archive),
        })
      }
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
