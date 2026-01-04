import { useMemo } from "react"
import type {
  PackageFile,
  PackageRelease,
} from "fake-snippets-api/lib/db/schema"
import type { PackageInfo } from "@/lib/types"

interface UsePackageWebsiteParams {
  packageInfo?: PackageInfo
  packageRelease?: PackageRelease | null
  releaseFiles?: PackageFile[] | null
  overrideWebsite?: string | null
}

const buildPreviewDomain = (packageInfo?: PackageInfo) => {
  if (!packageInfo?.name?.includes("/")) return null
  const [owner, pkgName] = packageInfo.name.split("/")
  if (!owner || !pkgName) return null
  return `${owner}-${pkgName}.tscircuit.app`
}

const hasDistIndexHtml = (releaseFiles?: PackageFile[] | null) => {
  return releaseFiles?.some((file) => file.file_path === "dist/index.html")
}

const isLatestReleaseBuilt = (packageRelease?: PackageRelease | null) => {
  return packageRelease?.display_status === "complete"
}

export const usePackageWebsite = ({
  packageInfo,
  packageRelease,
  releaseFiles,
  overrideWebsite,
}: UsePackageWebsiteParams) => {
  return useMemo(() => {
    const trimmedOverride = overrideWebsite?.trim()
    if (trimmedOverride) return trimmedOverride

    const providedWebsite = (packageInfo as any)?.website as string | undefined
    if (providedWebsite) return providedWebsite

    if (isLatestReleaseBuilt(packageRelease) && hasDistIndexHtml(releaseFiles)) {
      const previewDomain = buildPreviewDomain(packageInfo)
      if (previewDomain) {
        return `https://${previewDomain}`
      }
    }

    return ""
  }, [overrideWebsite, packageInfo, packageRelease, releaseFiles])
}
