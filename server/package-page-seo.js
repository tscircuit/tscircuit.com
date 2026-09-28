const allowedThumbnailViews = new Set(["schematic", "pcb", "assembly", "3d"])

export const getPackagePageImageUrl = ({
  registryUrl,
  packageInfo,
  packageRelease,
  author,
  packageName,
}) => {
  const defaultView = packageInfo.default_view || "3d"
  const thumbnailView = allowedThumbnailViews.has(defaultView)
    ? defaultView
    : "3d"

  if (thumbnailView === "3d") {
    const releaseId =
      packageRelease?.package_release_id ??
      packageInfo.latest_package_release_id
    const query = releaseId
      ? `package_release_id=${encodeURIComponent(releaseId)}`
      : `fs_sha=${encodeURIComponent(packageInfo.latest_package_release_fs_sha || "")}`

    return `${registryUrl}/packages/images/${encodeURIComponent(author)}/${encodeURIComponent(packageName)}/3d-whitebg.png?${query}`
  }

  return `${registryUrl}/packages/images/${encodeURIComponent(
    author,
  )}/${encodeURIComponent(packageName)}/${thumbnailView}.png?fs_sha=${encodeURIComponent(
    packageInfo.latest_package_release_fs_sha || "",
  )}`
}
