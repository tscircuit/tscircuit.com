import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Snippet } from "fake-snippets-api/lib/db/schema"

export const useSnippetByName = (fullSnippetName: string | null) => {
  const axios = useAxios()
  return useQuery<Snippet, Error>(
    ["snippet", fullSnippetName],
    async () => {
      if (!fullSnippetName) return
      const { data } = await axios.get("/snippets/get", {
        params: { full_snippet_name: fullSnippetName },
      })
      return data.snippet
    },
    {
      enabled: Boolean(fullSnippetName),
    },
  )
}
