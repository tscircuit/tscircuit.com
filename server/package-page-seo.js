const allowedThumbnailViews = new Set(["schematic", "pcb", "assembly", "3d"])

const makeAbsoluteUrl = (url, baseUrl) => {
  try {
    return new URL(url, `${baseUrl.replace(/\/+$/, "")}/`).toString()
  } catch {
    return url
  }
}

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
    const builtCadPreviewUrl =
      packageRelease?.cad_preview_image_url ??
      packageInfo.latest_cad_preview_image_url

    if (builtCadPreviewUrl) {
      return makeAbsoluteUrl(builtCadPreviewUrl, registryUrl)
    }
  }

  return `${registryUrl}/packages/images/${encodeURIComponent(
    author,
  )}/${encodeURIComponent(packageName)}/${thumbnailView}.png?fs_sha=${encodeURIComponent(
    packageInfo.latest_package_release_fs_sha || "",
  )}`
}
