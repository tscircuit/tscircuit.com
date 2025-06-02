import { usePackageFiles } from "@/hooks/use-package-files"
import { normalizeFilePath } from "@/lib/utils/normalizeFilePaths"
import md5 from "md5"

export const useGetFsMapHashForPackage = (packageReleaseId: string) => {
  const { data: pkgFilesList } = usePackageFiles(packageReleaseId)

  if (!pkgFilesList) {
    console.error(
      `No package files found for package release ${packageReleaseId}`,
    )
    return null
  }

  const fsMap: Record<string, string> = {}
  for (const file of pkgFilesList) {
    if (file.file_path.startsWith("dist/")) continue

    const normalizedPath = normalizeFilePath(file.file_path)
    fsMap[normalizedPath] = file.content_text ?? ""
  }

  const fsMapHash = md5(JSON.stringify(fsMap))
  return `md5-${fsMapHash}`
}
