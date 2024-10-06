import { useCurrentSnippetId } from "./use-current-snippet-id"
import { useSnippet } from "./use-snippet"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useAxios } from "./use-axios"

export const useCurrentSnippet = (): {
  snippet: Snippet | null
  isLoading: boolean
  error: Error | null
} => {
  const snippetId = useCurrentSnippetId()
  const axios = useAxios()
  const { data: snippet, isLoading, error } = useSnippet(snippetId || "")

  return {
    snippet: snippet || null,
    isLoading,
    error: error || null,
  }
}
