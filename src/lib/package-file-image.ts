export type PackageFileImageKind = "png" | "svg"

export const getPackageFileImageKind = (
  contentMimetype?: string | null,
): PackageFileImageKind | null => {
  const normalizedMimetype = contentMimetype
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase()

  if (normalizedMimetype === "image/png") return "png"
  if (normalizedMimetype === "image/svg+xml") return "svg"

  return null
}

export const getPackageFileImageUrl = ({
  apiBaseUrl,
  packageFileId,
}: {
  apiBaseUrl: string
  packageFileId: string
}) => {
  const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, "")

  return `${normalizedApiBaseUrl}/package_files/download?package_file_id=${encodeURIComponent(
    packageFileId,
  )}`
}
