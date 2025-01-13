import React from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { PrefetchLink } from "./PrefetchLink"

export const LatestSnippets: React.FC = () => {
  const axios = useAxios()
  const {
    data: snippets,
    isLoading,
    error,
  } = useQuery<Snippet[]>("latestSnippets", async () => {
    const response = await axios.get("/snippets/list_newest")
    return response.data.snippets
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading snippets</div>

  return (
    <div className="space-y-4">
      {snippets?.map((snippet) => (
        <div key={snippet.snippet_id} className="border p-4 rounded-md">
          <PrefetchLink
            href={`/${snippet.owner_name}/${snippet.unscoped_name}`}
            className="text-blue-600 hover:underline"
          >
            <h3 className="text-lg font-semibold">{snippet.unscoped_name}</h3>
          </PrefetchLink>
          <p className="text-sm text-gray-600">by {snippet.owner_name}</p>
          <p className="text-sm text-gray-500">
            Created: {new Date(snippet.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
