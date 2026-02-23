import type { PublicPackageRelease } from "fake-snippets-api/lib/db/schema"

export const isVersionOlderByTime = (
  currentVersion: string,
  latestVersion: string,
  releases: PublicPackageRelease[],
): boolean => {
  const currentRelease = releases.find((r) => r.version === currentVersion)
  const latestRelease = releases.find((r) => r.version === latestVersion)
  if (!currentRelease || !latestRelease) return false
  return (
    new Date(currentRelease.created_at).getTime() <
    new Date(latestRelease.created_at).getTime()
  )
}
