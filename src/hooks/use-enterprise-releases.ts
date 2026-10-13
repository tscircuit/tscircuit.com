import { useQuery } from "react-query"

export const enterpriseReleasesUrl =
  "https://github.com/tscircuit/tscircuit-standalone/releases"

export interface EnterpriseRelease {
  id: number
  name: string | null
  tag_name: string
  html_url: string
  published_at: string
  prerelease: boolean
}

interface GitHubRelease extends Omit<EnterpriseRelease, "published_at"> {
  draft: boolean
  published_at: string | null
}

export const useEnterpriseReleases = () =>
  useQuery<EnterpriseRelease[], Error>(
    "enterprise-releases",
    async ({ signal }) => {
      const response = await fetch(
        "https://api.github.com/repos/tscircuit/tscircuit-standalone/releases?per_page=10",
        { signal, headers: { Accept: "application/vnd.github+json" } },
      )
      if (!response.ok) {
        throw new Error(`Unable to load releases (${response.status})`)
      }

      const releases: GitHubRelease[] = await response.json()
      return releases
        .filter(
          (release): release is EnterpriseRelease & { draft: boolean } =>
            !release.draft && release.published_at !== null,
        )
        .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    },
    {
      staleTime: 5 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
