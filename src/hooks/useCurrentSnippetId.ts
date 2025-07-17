import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { useEffect, useRef, useState } from "react"
import { useMutation } from "react-query"
import { useLocation, useParams } from "wouter"
import { useAxios } from "./useAxios"
import { useCreateSnippetMutation } from "./use-create-snippet-mutation"
import { useGlobalStore } from "./use-global-store"
import { useSnippetByName } from "./useSnippetByName"
import { useUrlParams } from "./useUrlParams"

export const useCurrentSnippetId = (): {
  snippetId: string | null
  packageId: string | null
  isLoading: boolean
  error: (Error & { status: number }) | null
} => {
  const urlParams = useUrlParams()
  const urlSnippetId = urlParams.snippet_id ?? urlParams.package_id
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
    wouter.author && (wouter.snippetName || wouter.packageName)
      ? `${wouter.author}/${wouter.snippetName || wouter.packageName}`
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

  const snippetId = snippetIdFromUrl ?? snippetByName?.snippet_id ?? null
  return {
    snippetId,
    packageId: snippetId,
    isLoading: isLoadingSnippetByName,
    error: errorSnippetByName,
  }
}
