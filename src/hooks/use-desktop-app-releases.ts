import { useQuery } from "react-query"

export const desktopAppReleasesUrl =
  "https://github.com/tscircuit/tscircuit-desktop/releases"

export interface DesktopAppRelease {
  id: number
  name: string | null
  tag_name: string
  html_url: string
  published_at: string
  prerelease: boolean
  assets: { name: string; browser_download_url: string }[]
}

interface GitHubRelease extends Omit<DesktopAppRelease, "published_at"> {
  draft: boolean
  published_at: string | null
}

export const useDesktopAppReleases = () =>
  useQuery<DesktopAppRelease[], Error>(
    "desktop-app-releases",
    async ({ signal }) => {
      const response = await fetch(
        "https://api.github.com/repos/tscircuit/tscircuit-desktop/releases?per_page=10",
        { signal, headers: { Accept: "application/vnd.github+json" } },
      )
      if (!response.ok) {
        throw new Error(`Unable to load releases (${response.status})`)
      }

      const releases: GitHubRelease[] = await response.json()
      return releases
        .filter(
          (release): release is DesktopAppRelease & { draft: boolean } =>
            !release.draft &&
            !release.prerelease &&
            release.published_at !== null,
        )
        .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    },
    {
      staleTime: 5 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
