import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import md5 from "md5"

export const useGetFsMapHashForPackage = (packageId: string) => {
  const { data: pkgRelease } = usePackageReleaseById(packageId)
  if (!pkgRelease) {
    console.error("No package release found for package", packageId)
    return null
  }
  const { data: pkgFilesList } = usePackageFiles(pkgRelease.package_release_id)
  if (!pkgFilesList) {
    console.error("No package files found for package", packageId)
    return null
  }
  const fsMap = new Map<string, string>()
  for (const file of pkgFilesList) {
    if (file.content_text) {
      fsMap.set(file.file_path, file.content_text)
    }
  }
  const fsMapHash = md5(JSON.stringify(fsMap))
  return `md5-${fsMapHash}`
}
