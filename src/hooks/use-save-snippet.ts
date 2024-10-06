import { useState } from "react"
import { useAxios } from "./use-axios"
import { useMutation } from "react-query"
import { Snippet } from "fake-snippets-api/lib/db/schema"

export const useSaveSnippet = () => {
  const axios = useAxios()

  const saveSnippetMutation = useMutation<
    Snippet,
    Error,
    { code: string; snippet_type: string }
  >({
    mutationFn: async ({ code, snippet_type }) => {
      const response = await axios.post("/snippets/create", {
        code,
        snippet_type,
        owner_name: "seveibar", // Replace with actual user name or fetch from user context
      })
      return response.data.snippet
    },
  })

  const saveSnippet = async (code: string, snippet_type: string) => {
    return saveSnippetMutation.mutateAsync({ code, snippet_type })
  }

  return {
    saveSnippet,
    isLoading: saveSnippetMutation.isLoading,
    error: saveSnippetMutation.error,
  }
}
