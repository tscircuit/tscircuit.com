import { useEffect, useRef, useState } from "react"
import { useUrlParams } from "./use-url-params"
import { useAxios } from "./use-axios"
import { useLocation, useParams } from "wouter"
import { useMutation } from "react-query"
import { useSnippetByName } from "./use-snippet-by-name"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { useGlobalStore } from "./use-global-store"

export const useCurrentSnippetId = (): string | null => {
  const urlParams = useUrlParams()
  const urlSnippetId = urlParams.snippet_id
  const templateName = urlParams.template
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const wouter = useParams()
  const [location] = useLocation()
  const axios = useAxios()
  const [snippetIdFromUrl, setSnippetId] = useState<string | null>(urlSnippetId)

  const { data: snippetByName } = useSnippetByName(
    wouter.author && wouter.snippetName
      ? `${wouter.author}/${wouter.snippetName}`
      : null,
  )

  const createSnippetMutation = useMutation({
    mutationKey: ["createSnippet"],
    mutationFn: async () => {
      const template = getSnippetTemplate(templateName)
      const {
        data: { snippet },
      } = await axios.post("/snippets/create", {
        code: template.code,
        snippet_type: template.type ?? "board",
        owner_name: "seveibar",
      })
      return snippet
    },
    onSuccess: (snippet: any) => {
      const url = new URL(window.location.href)
      url.searchParams.set("snippet_id", snippet.snippet_id)
      url.searchParams.delete("template")
      window.history.pushState({}, "", url.toString())
      setSnippetId(snippet.snippet_id)
    },
    onError: (error: any) => {
      console.error("Error creating snippet:", error)
    },
  })

  useEffect(() => {
    if (snippetIdFromUrl) return
    if (location !== "/editor") return
    if (wouter?.author && wouter?.snippetName) return
    if ((window as any).AUTO_CREATED_SNIPPET) return
    if (!isLoggedIn) return
    ;(window as any).AUTO_CREATED_SNIPPET = true
    createSnippetMutation.mutate()
    return () => {
      setTimeout(() => {
        ;(window as any).AUTO_CREATED_SNIPPET = false
      }, 1000)
    }
  }, [])

  useEffect(() => {
    if (templateName) {
      const url = new URL(window.location.href)
      url.searchParams.delete("template")
      window.history.replaceState({}, "", url.toString())
    }
  }, [templateName])

  return snippetIdFromUrl ?? snippetByName?.snippet_id ?? null
}
