import { useAxios } from "@/hooks/use-axios"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useMemo, useState } from "react"
import { useQueries, useQuery } from "react-query"
import { useGlobalStore } from "./use-global-store"

function isTextContent(str: string): boolean {
  return !str.includes("\0")
}

function blobToBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export interface PackageFile {
  path: string
  content: string
  isBinary?: boolean
  downloadUrl?: string
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
  releaseId?: string | null,
) {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const [loadedFiles, setLoadedFiles] = useState<Map<string, PackageFile>>(
    new Map(),
  )
  const sessionToken = useGlobalStore((s) => s.session?.token)

  const pkgFiles = usePackageFiles(releaseId ?? pkg?.latest_package_release_id)

  const targetFilePath = useMemo(() => {
    if (!pkgFiles.data) return priorityFilePath

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

    // Check for index.tsx first
    const indexFile = pkgFiles.data.find((f) => f.file_path === "index.tsx")
    if (indexFile) return indexFile.file_path

    // Fallback to first file
    return pkgFiles.data[0]?.file_path || null
  }, [pkgFiles.data, priorityFilePath])

  const priorityFileData = pkgFiles.data?.find(
    (file) => file.file_path === targetFilePath,
  )

  const priorityFileQuery = useQuery({
    queryKey: ["priorityPackageFile", priorityFileData?.package_file_id],
    queryFn: async () => {
      if (!priorityFileData) return null

      // First get file metadata to check if it's binary
      const response = await axios.get(`/package_files/get`, {
        params: { package_file_id: priorityFileData.package_file_id },
      })
      const packageFile = response.data.package_file

      let content: string
      let isBinary = false
      let fileDownloadUrl: string | undefined
      if (packageFile?.is_text === false) {
        const downloadUrl = `${apiBaseUrl}/package_files/download?package_file_id=${priorityFileData.package_file_id}`
        const binaryResponse = await fetch(downloadUrl, {
          headers: sessionToken
            ? {
                Authorization: `Bearer ${sessionToken}`,
              }
            : {},
        })
        const blob = await binaryResponse.blob()
        const text = await blob.text()
        if (isTextContent(text)) {
          content = text
        } else {
          content = blobToBlobUrl(blob)
          isBinary = true
          fileDownloadUrl = downloadUrl
        }
      } else {
        content = packageFile?.content_text ?? ""
      }
      const file: PackageFile = {
        path: priorityFileData.file_path,
        content,
        ...(isBinary && { isBinary, downloadUrl: fileDownloadUrl }),
      }

      setLoadedFiles((prev) => {
        const newMap = new Map(prev)
        newMap.set(file.path, file)
        return newMap
      })

      return file
    },
    enabled: !!priorityFileData,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 0,
    cacheTime: 1000,
  })

  const remainingFilesQueries = useQueries(
    pkgFiles.data
      ?.filter((file) => file.file_path !== targetFilePath)
      ?.map((file) => ({
        queryKey: ["packageFile", file.package_file_id],
        queryFn: async () => {
          // First get file metadata to check if it's binary
          const response = await axios.get(`/package_files/get`, {
            params: { package_file_id: file.package_file_id },
          })
          const packageFile = response.data.package_file

          let content: string
          let isBinary = false
          let fileDownloadUrl: string | undefined
          if (packageFile?.is_text === false) {
            const downloadUrl = `${apiBaseUrl}/package_files/download?package_file_id=${file.package_file_id}`
            const binaryResponse = await fetch(downloadUrl, {
              headers: sessionToken
                ? {
                    Authorization: `Bearer ${sessionToken}`,
                  }
                : {},
            })
            const blob = await binaryResponse.blob()
            const text = await blob.text()
            if (isTextContent(text)) {
              content = text
            } else {
              content = blobToBlobUrl(blob)
              isBinary = true
              fileDownloadUrl = downloadUrl
            }
          } else {
            content = packageFile?.content_text ?? ""
          }
          const fileData: PackageFile = {
            path: file.file_path,
            content,
            ...(isBinary && { isBinary, downloadUrl: fileDownloadUrl }),
          }

          setLoadedFiles((prev) => {
            const newMap = new Map(prev)
            newMap.set(fileData.path, fileData)
            return newMap
          })

          return fileData
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        staleTime: 0,
        cacheTime: 1000,
      })) ?? [],
  )

  const allFiles = useMemo(() => {
    const files = Array.from(loadedFiles.values())
    return files
  }, [loadedFiles])

  const areAllFilesLoading =
    remainingFilesQueries.some((q) => q.isLoading) ||
    priorityFileQuery.isLoading
  const error =
    priorityFileQuery.error || remainingFilesQueries.find((q) => q.error)?.error

  return {
    priorityFile: priorityFileQuery.data || null,
    priorityFileFetched: priorityFileQuery.isFetched,
    allFiles,
    isPriorityLoading: priorityFileQuery.isLoading,
    areAllFilesLoading,
    error,
    isMetaLoading: pkgFiles.isLoading,
    totalFilesCount: pkgFiles.data?.length || 0,
    loadedFilesCount: allFiles.length,
    isPriorityFileFetched: priorityFileQuery.isFetched,
  }
}
