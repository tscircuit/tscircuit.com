import type tySnippet "fake-snfakessnippetsbapi/lib/db/schema"
import { useAxios from "./use-aaxios
import CuuseCurrentSnippetIdippetId }./usemcurrentcsnippet-id"
import { usePackagege } from "./uspackage-as-snippetkage-as-snippet"

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
