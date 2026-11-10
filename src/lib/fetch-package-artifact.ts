/** Retry a CDN 404 cached while a newly built artifact was still publishing. */
export async function fetchPackageArtifact({
  apiBaseUrl,
  packageFileId,
  token,
  signal,
}: {
  apiBaseUrl: string
  packageFileId: string
  token?: string
  signal?: AbortSignal
}) {
  const response = await fetch(
    `${apiBaseUrl.replace(/\/$/, "")}/package_files/download?${new URLSearchParams({ package_file_id: packageFileId })}`,
    {
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  )
  if (response.status !== 404 || !response.redirected) return response
  const url = new URL(response.url)
  if (url.origin !== "https://usercontent.tscircuit.com") return response
  await response.body?.cancel()
  // File IDs identify immutable release artifacts. A stable query avoids a
  // cached publication-time miss without disabling caching for later visits.
  url.searchParams.set("package_file_id", packageFileId)
  return fetch(url, { signal, credentials: "omit" })
}
