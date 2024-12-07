import { useEffect, useRef, useState } from "react"
import { useUrlParams } from "./use-url-params"
import { useAxios } from "./use-axios"
import { useLocation, useParams } from "wouter"
import { useMutation } from "react-query"
import { useSnippetByName } from "./use-snippet-by-name"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { useGlobalStore } from "./use-global-store"
import { useCreateSnippetMutation } from "./use-create-snippet-mutation"

export const useCurrentSnippetId = (): {
  snippetId: string | null
  isLoading: boolean
  error: (Error & { status: number }) | null
} => {
  const urlParams = useUrlParams()
  const urlSnippetId = urlParams.snippet_id
  const templateName = urlParams.template
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const wouter = useParams()
  const [location] = useLocation()
  const [snippetIdFromUrl, setSnippetId] = useState<string | null>(urlSnippetId)

  useEffect(() => {
    if (urlSnippetId) {
      setSnippetId(urlSnippetId)
    }
  }, [urlSnippetId])

  const {
    data: snippetByName,
    isLoading: isLoadingSnippetByName,
    error: errorSnippetByName,
  } = useSnippetByName(
    wouter.author && wouter.snippetName
      ? `${wouter.author}/${wouter.snippetName}`
      : null,
  )

  const createSnippetMutation = useCreateSnippetMutation({
    onSuccess: (snippet) => {
      setSnippetId(snippet.snippet_id)
    },
  })

  useEffect(() => {
    if (snippetIdFromUrl) return
    if (location !== "/editor") return
    if (wouter?.author && wouter?.snippetName) return
    if ((window as any).AUTO_CREATED_SNIPPET) return
    if (!isLoggedIn) return
    if (!urlParams.should_create_snippet) return
    ;(window as any).AUTO_CREATED_SNIPPET = true
    createSnippetMutation.mutate({})
    return () => {
      setTimeout(() => {
        ;(window as any).AUTO_CREATED_SNIPPET = false
      }, 1000)
    }
  }, [])

  useEffect(() => {
    if (templateName) {
      const url = new URL(window.location.href)
      url.searchParams.delete("should_create_snippet")
      window.history.replaceState({}, "", url.toString())
    }
  }, [templateName])

  return {
    snippetId: snippetIdFromUrl ?? snippetByName?.snippet_id ?? null,
    isLoading: isLoadingSnippetByName,
    error: errorSnippetByName,
  }
}
