import { normalizeFilePath } from "@/lib/utils/normalizeFilePath"
import md5 from "md5"
import { usePackageFilesLoader } from "./usePackageFilesLoader"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useQueries } from "react-query"
import { usePackageFiles } from "./use-package-files"
import { useAxios } from "./use-axios"

export const useGetFsMapHashForPackage = (packageReleaseId: string) => {
  const axios = useAxios()
  const pkgFiles = usePackageFiles(packageReleaseId)

  const queries = useQueries(
    pkgFiles.data?.map((file) => ({
      queryKey: ["packageFile", file.package_file_id],
      queryFn: async () => {
        const response = await axios.post(`/package_files/get`, {
          package_file_id: file.package_file_id,
        })
        const content = response.data.package_file?.content_text
        return { path: file.file_path, content: content ?? "" }
      },
      staleTime: 2,
    })) ?? [],
  )

  const isLoading = queries.some((query) => query.isLoading)
  const error = queries.find((query) => query.error)?.error

  if (isLoading) return null
  if (error) {
    console.error(`Error loading package files: ${error}`)
    return null
  }

  const fsMap: Record<string, string> = {}
  queries.forEach((query) => {
    if (query.data?.path.startsWith("dist/")) return
    fsMap[normalizeFilePath(query.data?.path ?? "")] = query.data?.content ?? ""
  })

  const fsMapHash = md5(JSON.stringify(fsMap))
  return `md5-${fsMapHash}`
}
