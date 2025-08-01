import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { isValidFileName } from "@/lib/utils/isValidFileName"
import { PackageFile } from "@/types/package"
import { DEFAULT_CODE } from "@/lib/utils/package-utils"
import { Package } from "fake-snippets-api/lib/db/schema"
import { usePackageFiles } from "./use-package-files"
import { decodeUrlHashToText } from "@/lib/decodeUrlHashToText"
import { decodeUrlHashToFsMap } from "@/lib/decodeUrlHashToFsMap"
import { usePackageFilesLoader } from "./usePackageFilesLoader"
import { useGlobalStore } from "./use-global-store"
import { useToast } from "@/components/ViewPackagePage/hooks/use-toast"
import { useUpdatePackageFilesMutation } from "./useUpdatePackageFilesMutation"
import { useCreatePackageReleaseMutation } from "./use-create-package-release-mutation"
import { useCreatePackageMutation } from "./use-create-package-mutation"
import { findTargetFile } from "@/lib/utils/findTargetFile"
import { encodeFsMapToUrlHash } from "@/lib/encodeFsMapToUrlHash"
import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"

export interface ICreateFileProps {
  newFileName: string
  content?: string
  onError: (error: Error) => void
  openFile?: boolean
}
export interface ICreateFileResult {
  newFileCreated: boolean
}

export interface IDeleteFileResult {
  fileDeleted: boolean
}
export interface IDeleteFileProps {
  filename: string
  onError: (error: Error) => void
}

export interface IRenameFileProps {
  oldFilename: string
  newFilename: string
  onError: (error: Error) => void
}

export interface IRenameFileResult {
  fileRenamed: boolean
}

export function useFileManagement({
  templateCode,
  currentPackage,
  fileChoosen,
  openNewPackageSaveDialog,
  updateLastUpdated,
}: {
  templateCode?: string
  currentPackage?: Package
  fileChoosen: string | null
  openNewPackageSaveDialog: () => void
  updateLastUpdated: () => void
}) {
  const [localFiles, setLocalFiles] = useState<PackageFile[]>([])
  const [initialFiles, setInitialFiles] = useState<PackageFile[]>([])
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const loggedInUser = useGlobalStore((s) => s.session)
  const { toast } = useToast()
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const {
    data: packageFilesWithContent,
    isLoading: isLoadingPackageFilesWithContent,
  } = usePackageFilesLoader(currentPackage)
  const { data: packageFilesMeta, isLoading: isLoadingPackageFiles } =
    usePackageFiles(currentPackage?.latest_package_release_id)
  const initialCodeContent = useMemo(() => {
    return (
      (!!decodeUrlHashToText(window.location.toString()) &&
      decodeUrlHashToText(window.location.toString()) !== ""
        ? decodeUrlHashToText(window.location.toString())
        : templateCode) || DEFAULT_CODE
    )
  }, [templateCode, currentPackage])
  const manualEditsFileContent = useMemo(() => {
    return (
      localFiles?.find((file) => file.path === "manual-edits.json")?.content ||
      "{}"
    )
  }, [localFiles])

  const updatePackageFilesMutation = useUpdatePackageFilesMutation({
    currentPackage,
    localFiles,
    initialFiles,
    packageFilesMeta: packageFilesMeta || [],
  })
  const { mutate: createRelease, isLoading: isCreatingRelease } =
    useCreatePackageReleaseMutation({
      onSuccess: () => {
        toast({
          title: "Package released",
          description: "Your package has been released successfully.",
        })
      },
    })
  const createPackageMutation = useCreatePackageMutation({
    onSuccess: (newPackage) => {
      createRelease(
        {
          package_name_with_version: `${newPackage.name}@latest`,
        },
        {
          onSuccess: () => {
            updatePackageFilesMutation.mutate({
              package_name_with_version: `${newPackage.name}@latest`,
              ...newPackage,
            })
            const url = new URL(window.location.href)
            url.searchParams.set("package_id", newPackage.package_id)
            url.searchParams.delete("template")
            url.searchParams.delete("should_create_package")
            window.history.pushState({}, "", url.toString())
            window.dispatchEvent(new Event("popstate"))
            updateLastUpdated()
            setInitialFiles([...localFiles])
          },
        },
      )
    },
  })

  useEffect(() => {
    if (!currentPackage || isLoadingPackageFilesWithContent) {
      const decodedFsMap = decodeUrlHashToFsMap(window.location.toString())

      if (decodedFsMap && Object.keys(decodedFsMap).length > 0) {
        const filesFromUrl = Object.entries(decodedFsMap).map(
          ([path, content]) => ({
            path,
            content: String(content),
          }),
        )
        const targetFile = findTargetFile(filesFromUrl, fileChoosen)
        setLocalFiles(filesFromUrl)
        setInitialFiles([])
        setCurrentFile(targetFile?.path || filesFromUrl[0]?.path || null)
        return
      }

      setLocalFiles([
        {
          path: "index.tsx",
          content: initialCodeContent || "",
        },
      ])
      setInitialFiles([])
      setCurrentFile("index.tsx")
      return
    } else {
      const targetFile = findTargetFile(
        packageFilesWithContent || [],
        fileChoosen,
      )
      setLocalFiles(packageFilesWithContent || [])
      setInitialFiles(packageFilesWithContent || [])
      setCurrentFile(targetFile?.path || null)
    }
  }, [currentPackage, isLoadingPackageFilesWithContent])

  const isLoading = useMemo(() => {
    return (
      isLoadingPackageFilesWithContent || isLoadingPackageFiles || !localFiles
    )
  }, [isLoadingPackageFilesWithContent, localFiles, isLoadingPackageFiles])

  const fsMap = useMemo(() => {
    const map = localFiles.reduce(
      (acc, file) => {
        acc[file.path] = file.content || ""
        return acc
      },
      {} as Record<string, string>,
    )
    return map
  }, [localFiles, manualEditsFileContent])

  const onFileSelect = (fileName: string) => {
    if (localFiles.some((file) => file.path === fileName)) {
      setCurrentFile(fileName)
    } else {
      setCurrentFile(null)
    }
  }

  const createFile = ({
    newFileName,
    onError,
    content,
    openFile = true,
  }: ICreateFileProps): ICreateFileResult => {
    newFileName = newFileName.trim()

    if (!newFileName) {
      onError(new Error("File name cannot be empty"))
      return {
        newFileCreated: false,
      }
    }

    if (!isValidFileName(newFileName)) {
      onError(
        new Error(
          "Invalid file name. Avoid special characters and relative paths (. or ..)",
        ),
      )
      return {
        newFileCreated: false,
      }
    }

    // Check if file already exists
    const fileExists = localFiles?.some((file) => file.path === newFileName)
    if (fileExists) {
      onError(new Error(`File '${newFileName}' already exists`))
      return {
        newFileCreated: false,
      }
    }

    // Ensure file name is not empty after path construction
    const fileName = newFileName.split("/").pop() || ""
    if (!fileName.trim()) {
      onError(new Error("File name cannot be empty"))
      return {
        newFileCreated: false,
      }
    }

    const updatedFiles = [
      ...(localFiles || []),
      { path: newFileName, content: content || "" },
    ]
    setLocalFiles(updatedFiles)

    if (openFile) {
      setCurrentFile(newFileName)
    }

    return {
      newFileCreated: true,
    }
  }

  const deleteFile = ({
    filename,
    onError,
  }: IDeleteFileProps): IDeleteFileResult => {
    const fileExists = localFiles?.some((file) => file.path === filename)
    if (!fileExists) {
      onError(new Error("File does not exist"))
      return {
        fileDeleted: false,
      }
    }
    const updatedFiles = localFiles.filter((file) => file.path !== filename)
    setLocalFiles(updatedFiles)
    onFileSelect(
      updatedFiles.filter((file) => !isHiddenFile(file.path))[0]?.path || "",
    )
    return {
      fileDeleted: true,
    }
  }

  const renameFile = ({
    oldFilename,
    newFilename,
    onError,
  }: IRenameFileProps): IRenameFileResult => {
    newFilename = newFilename.trim()
    if (!newFilename) {
      onError(new Error("File name cannot be empty"))
      return {
        fileRenamed: false,
      }
    }

    // Extract just the filename from the path for validation
    const fileNameOnly = newFilename.split("/").pop() || ""
    if (!isValidFileName(fileNameOnly)) {
      onError(new Error("Invalid file name"))
      return {
        fileRenamed: false,
      }
    }

    const oldFileExists = localFiles?.some((file) => file.path === oldFilename)
    if (!oldFileExists) {
      onError(new Error("File does not exist"))
      return {
        fileRenamed: false,
      }
    }

    const newFileExists = localFiles?.some((file) => file.path === newFilename)
    if (newFileExists) {
      onError(new Error("A file with this name already exists"))
      return {
        fileRenamed: false,
      }
    }

    const updatedFiles = localFiles.map((file) => {
      if (file.path === oldFilename) {
        return { ...file, path: newFilename }
      }
      return file
    })

    setLocalFiles(updatedFiles)
    if (currentFile === oldFilename) {
      setCurrentFile(newFilename)
    }

    return {
      fileRenamed: true,
    }
  }

  const savePackage = async (isPrivate: boolean) => {
    if (!isLoggedIn) {
      toast({
        title: "Not Logged In",
        description: "You must be logged in to save your package.",
      })
      return
    }

    await createPackageMutation.mutateAsync({
      is_private: isPrivate,
    })
  }

  const saveToUrl = useCallback(
    (files: PackageFile[]) => {
      if (isLoggedIn || !files.length) return

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        try {
          const map = files.reduce(
            (acc, f) => {
              acc[f.path] = f.content || ""
              return acc
            },
            {} as Record<string, string>,
          )

          const snippetUrl = encodeFsMapToUrlHash(map)
          if (typeof snippetUrl !== "string") return

          const currentUrl = new URL(window.location.href)
          const urlParts = snippetUrl.split("#")

          if (urlParts.length > 1 && urlParts[1]) {
            const newHash = urlParts[1]
            if (newHash.length > 8000) return

            currentUrl.hash = newHash
            const finalUrl = currentUrl.toString()

            if (finalUrl.length <= 32000) {
              window.history.replaceState(null, "", finalUrl)
            }
          }
        } catch (error) {
          console.warn("Failed to save code to URL:", error)
        }
      }, 1000)
    },
    [isLoggedIn, currentFile],
  )

  useEffect(() => {
    if (!isLoggedIn && localFiles.length > 0) {
      saveToUrl(localFiles)
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [localFiles, saveToUrl, isLoggedIn])

  const saveFiles = () => {
    if (!isLoggedIn) {
      // For non-logged-in users, trigger immediate URL save
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      saveToUrl(localFiles)

      toast({
        title: "Code Saved to URL",
        description:
          "Your code has been saved to the URL. Bookmark this page to access your code later.",
      })
      return
    }

    if (!currentPackage) {
      openNewPackageSaveDialog()
      return
    }
    updatePackageFilesMutation.mutate({
      package_name_with_version: `${currentPackage.name}@latest`,
      ...currentPackage,
    })
    updateLastUpdated()
    setInitialFiles([...localFiles])
  }

  const isSaving = useMemo(() => {
    return (
      updatePackageFilesMutation.isLoading ||
      createPackageMutation.isLoading ||
      isCreatingRelease
    )
  }, [
    updatePackageFilesMutation.isLoading,
    createPackageMutation.isLoading,
    isCreatingRelease,
  ])

  return {
    fsMap,
    createFile,
    deleteFile,
    renameFile,
    saveFiles,
    localFiles,
    initialFiles,
    currentFile,
    setLocalFiles,
    onFileSelect,
    isLoading,
    isSaving,
    savePackage,
    packageFilesMeta,
  }
}
