import { useState, useEffect } from "react"
import type { PackageFile } from "@/types/package"
import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"

export interface IDeleteDirectoryProps {
  directoryPath: string
  onError: (error: Error) => void
}

export interface IDeleteDirectoryResult {
  deleted: boolean
}

export function useDeleteFilesFromDirectory({
  localFiles,
  setLocalFiles,
  currentFile,
  onFileSelect,
}: {
  localFiles: PackageFile[]
  setLocalFiles: (files: PackageFile[]) => void
  currentFile: string | null
  onFileSelect: (path: string) => void
}) {
  const [preservedDirectories, setPreservedDirectories] = useState<Set<string>>(
    new Set(),
  )

  useEffect(() => {
    if (!localFiles) return
    setPreservedDirectories((prev) => {
      if (prev.size === 0) return prev
      const next = new Set(prev)
      let changed = false
      for (const dir of prev) {
        const prefix = dir.endsWith("/") ? dir : dir + "/"
        const hasRealContent = localFiles.some((f) => f.path.startsWith(prefix))
        if (hasRealContent) {
          next.delete(dir)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [localFiles])

  const deleteDirectory = ({
    directoryPath,
    onError,
  }: IDeleteDirectoryProps): IDeleteDirectoryResult => {
    const dirPrefix = directoryPath.endsWith("/")
      ? directoryPath
      : directoryPath + "/"
    const hasFiles = localFiles.some((file) => file.path.startsWith(dirPrefix))

    if (!hasFiles) {
      if (preservedDirectories.has(directoryPath)) {
        setPreservedDirectories(
          (prev) => new Set([...prev].filter((d) => d !== directoryPath)),
        )
        return { deleted: true }
      }
      onError(new Error("Directory does not exist"))
      return { deleted: false }
    }

    const updatedFiles = localFiles.filter(
      (file) => !file.path.startsWith(dirPrefix),
    )

    if (preservedDirectories.has(directoryPath)) {
      setPreservedDirectories(
        (prev) => new Set([...prev].filter((d) => d !== directoryPath)),
      )
    }

    setLocalFiles(updatedFiles)

    if (currentFile?.startsWith(dirPrefix)) {
      onFileSelect(
        updatedFiles.filter((file) => !isHiddenFile(file.path))[0]?.path || "",
      )
    }

    return { deleted: true }
  }

  const renamePreservedDirectories = ({
    oldDirectoryPath,
    newDirectoryPath,
  }: {
    oldDirectoryPath: string
    newDirectoryPath: string
  }) => {
    const oldPrefix = oldDirectoryPath.endsWith("/")
      ? oldDirectoryPath
      : `${oldDirectoryPath}/`

    setPreservedDirectories((prev) => {
      if (prev.size === 0) return prev

      let changed = false
      const next = new Set<string>()

      for (const dir of prev) {
        if (dir === oldDirectoryPath) {
          next.add(newDirectoryPath)
          changed = true
          continue
        }

        if (dir.startsWith(oldPrefix)) {
          next.add(`${newDirectoryPath}/${dir.slice(oldPrefix.length)}`)
          changed = true
          continue
        }

        next.add(dir)
      }

      return changed ? next : prev
    })
  }

  return {
    deleteDirectory,
    preservedDirectories,
    renamePreservedDirectories,
  }
}
