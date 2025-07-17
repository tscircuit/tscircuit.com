import type { Package } from "fake-snippets-api/lib/db/schema"
import { useQueries } from "react-query"
import { useAxios } from "./useAxios"
import { usePackageFileById, usePackageFiles } from "./use-package-files"

export interface PackageFile {
  path: string
  content: string
}

export function usePackageFilesLoader(pkg?: Package) {
  const axios = useAxios()
  const pkgFiles = usePackageFiles(pkg?.latest_package_release_id)
  const indexFileFromHook = usePackageFileById(
    pkgFiles.data?.find((x) => x.file_path === "index.tsx")?.package_file_id ??
      null,
  )

  const queries = useQueries(
    pkgFiles.data?.map((file) => ({
      queryKey: ["packageFile", file.package_file_id],
      queryFn: async () => {
        if (
          file.file_path === "index.tsx" &&
          indexFileFromHook.data?.content_text
        ) {
          return {
            path: file.file_path,
            content: indexFileFromHook.data.content_text,
          }
        }

        const response = await axios.post("/package_files/get", {
          package_file_id: file.package_file_id,
        })
        const content = response.data.package_file?.content_text
        return { path: file.file_path, content: content ?? "" }
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      cacheTime: 0,
    })) ?? [],
  )

  const isLoading = queries.some((query) => query.isLoading)
  const error = queries.find((query) => query.error)?.error

  const processedResults = queries
    .map((query) => query.data)
    .filter((x): x is PackageFile => x !== null)
    .filter(Boolean)

  return {
    isLoading,
    error,
    data: processedResults,
  }
}
