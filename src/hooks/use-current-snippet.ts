import { useCurrentSnippetId } from "./use-current-snippet-id"
import { usePackage } from "./use-package"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useAxios } from "./use-axios"

export const useCurrentSnippet = (): {
  snippet: Snippet | null
  isLoading: boolean
  error: (Error & { status: number }) | null
} => {
  const {
    snippetId,
    isLoading: isLoadingSnippetId,
    error: errorSnippetId,
  } = useCurrentSnippetId()
  const axios = useAxios()
  const { data: snippet, isLoading, error } = usePackage(snippetId || "")

  return {
    snippet: snippet || null,
    isLoading: isLoadingSnippetId || isLoading,
    error: errorSnippetId || error || null,
  }
}
