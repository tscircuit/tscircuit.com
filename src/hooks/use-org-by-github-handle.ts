import { useQuery } from "react-query"
import { usePublicAxios } from "@/hooks/use-public-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export const useOrgByGithubHandle = (githubHandle: string | null) => {
  const axios = usePublicAxios()
  return useQuery<PublicOrgSchema, Error & { status: number }>(
    ["orgs", "by-github-handle", githubHandle],
    async () => {
      if (!githubHandle) {
        throw new Error("GitHub handle is required")
      }
      const { data } = await axios.get("/orgs/get", {
        params: { github_handle: githubHandle },
      })
      return data.org
    },
    {
      enabled: Boolean(githubHandle),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
}
