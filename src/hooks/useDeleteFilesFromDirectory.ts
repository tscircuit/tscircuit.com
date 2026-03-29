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

function getAncestorDirectories(dirPath: string): string[] {
  const hasLeadingSlash = dirPath.startsWith("/")
  const normalized = hasLeadingSlash ? dirPath.slice(1) : dirPath
  const parts = normalized.split("/").filter(Boolean)
  const ancestors: string[] = []
  for (let i = 1; i < parts.length; i++) {
    const ancestor = parts.slice(0, i).join("/")
    ancestors.push(hasLeadingSlash ? `/${ancestor}` : ancestor)
  }
  return ancestors
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

    const ancestors = getAncestorDirectories(directoryPath)
    const emptyAncestors = ancestors.filter((ancestor) => {
      const prefix = ancestor.endsWith("/") ? ancestor : ancestor + "/"
      return !updatedFiles.some((file) => file.path.startsWith(prefix))
    })

    if (emptyAncestors.length > 0) {
      setPreservedDirectories((prev) => {
        const next = new Set(prev)
        emptyAncestors.forEach((a) => next.add(a))
        next.delete(directoryPath)
        return next
      })
    } else if (preservedDirectories.has(directoryPath)) {
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

  return {
    deleteDirectory,
    preservedDirectories,
  }
}
