import { usePackageFiles } from "@/hooks/use-package-files"
import md5 from "md5"

export const useGetFsMapHashForPackage = (packageReleaseId: string) => {
  const { data: pkgFilesList } = usePackageFiles(packageReleaseId)

  if (!pkgFilesList) {
    console.error("No package files found for package", packageReleaseId)
    return null
  }
  const fsMap = new Map<string, string>()
  for (const file of pkgFilesList) {
    fsMap.set(file.file_path, file.content_text ?? "")
  }
  const fsMapHash = md5(JSON.stringify(fsMap))
  return `md5-${fsMapHash}`
}
