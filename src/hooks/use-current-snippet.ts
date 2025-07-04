import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useAxios } from "./use-axios"
import { useCurrentSnippetId } from "./use-current-snippet-id"
import { useSnippet } from "./use-snippet"

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
  const { data: snippet, isLoading, error } = useSnippet(snippetId || "")

  return {
    snippet: snippet || null,
    isLoading: isLoadingSnippetId || isLoading,
    error: errorSnippetId || error || null,
  }
}
