import { useQuery, useQueries } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackageFileById } from "@/hooks/use-package-files"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useState, useEffect, useMemo } from "react"
import { findTargetFile } from "@/lib/utils/findTargetFile"

export interface PackageFile {
  path: string
  content: string
}

export interface OptimizedLoadingState {
  priorityFile: PackageFile | null
  allFiles: PackageFile[]
  isPriorityLoading: boolean
  areAllFilesLoading: boolean
  error: any
}

export function useOptimizedPackageFilesLoader(
  pkg?: Package,
  priorityFilePath?: string | null,
) {
  const axios = useAxios()
  const [loadedFiles, setLoadedFiles] = useState<Map<string, PackageFile>>(
    new Map(),
  )

  const pkgFiles = usePackageFiles(pkg?.latest_package_release_id)

  const targetFilePath = useMemo(() => {
    if (!pkgFiles.data) return null

    if (priorityFilePath) {
      const exactMatch = pkgFiles.data.find(
        (f) => f.file_path === priorityFilePath,
      )
      if (exactMatch) return exactMatch.file_path

      const partialMatch = pkgFiles.data.find(
        (f) =>
          f.file_path.includes(priorityFilePath) ||
          priorityFilePath.includes(f.file_path),
      )
      if (partialMatch) return partialMatch.file_path
    }

    const indexFile = pkgFiles.data.find((f) => f.file_path === "index.tsx")
    if (indexFile) return indexFile.file_path

    const mainFile = pkgFiles.data.find(
      (f) =>
        f.file_path === "main.tsx" ||
        f.file_path === "app.tsx" ||
        f.file_path === "App.tsx",
    )
    if (mainFile) return mainFile.file_path

    return pkgFiles.data[0]?.file_path || null
  }, [pkgFiles.data, priorityFilePath])

  const priorityFileData = pkgFiles.data?.find(
    (file) => file.file_path === targetFilePath,
  )

  const priorityFileQuery = useQuery({
    queryKey: ["priorityPackageFile", priorityFileData?.package_file_id],
    queryFn: async () => {
      if (!priorityFileData) return null

      const response = await axios.post(`/package_files/get`, {
        package_file_id: priorityFileData.package_file_id,
      })
      const content = response.data.package_file?.content_text
      const file = { path: priorityFileData.file_path, content: content ?? "" }

      setLoadedFiles((prev) => {
        const newMap = new Map(prev)
        newMap.set(file.path, file)
        return newMap
      })

      return file
    },
    enabled: !!priorityFileData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  })

  const remainingFilesQueries = useQueries(
    pkgFiles.data
      ?.filter((file) => file.file_path !== targetFilePath)
      ?.map((file) => ({
        queryKey: ["packageFile", file.package_file_id],
        queryFn: async () => {
          const response = await axios.post(`/package_files/get`, {
            package_file_id: file.package_file_id,
          })
          const content = response.data.package_file?.content_text
          const fileData = { path: file.file_path, content: content ?? "" }

          setLoadedFiles((prev) => {
            const newMap = new Map(prev)
            newMap.set(fileData.path, fileData)
            return newMap
          })

          return fileData
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
        cacheTime: Infinity,
      })) ?? [],
  )

  const allFiles = useMemo(() => {
    return Array.from(loadedFiles.values())
  }, [loadedFiles])

  const areAllFilesLoading =
    remainingFilesQueries.some((q) => q.isLoading) ||
    priorityFileQuery.isLoading
  const error =
    priorityFileQuery.error || remainingFilesQueries.find((q) => q.error)?.error

  return {
    priorityFile: priorityFileQuery.data || null,
    allFiles,
    isPriorityLoading: priorityFileQuery.isLoading,
    areAllFilesLoading,
    error,
    isMetaLoading: pkgFiles.isLoading,
    totalFilesCount: pkgFiles.data?.length || 0,
    loadedFilesCount: allFiles.length,
  }
}
