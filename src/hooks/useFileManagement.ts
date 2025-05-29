import { useEffect, useMemo, useState, useCallback } from "react"
import { isValidFileName } from "@/lib/utils/isValidFileName"
import {
  DEFAULT_CODE,
  generateRandomPackageName,
  PackageFile,
} from "../components/package-port/CodeAndPreview"
import { Package } from "fake-snippets-api/lib/db/schema"
import {
  usePackageFile,
  usePackageFileById,
  usePackageFiles,
} from "./use-package-files"
import { decodeUrlHashToText } from "@/lib/decodeUrlHashToText"
import { usePackageFilesLoader } from "./usePackageFilesLoader"
import { useGlobalStore } from "./use-global-store"
import { useToast } from "@/components/ViewPackagePage/hooks/use-toast"
import { useUpdatePackageFilesMutation } from "./useUpdatePackageFilesMutation"
import { useCreatePackageReleaseMutation } from "./use-create-package-release-mutation"
import { useCreatePackageMutation } from "./use-create-package-mutation"
import { findTargetFile } from "@/lib/utils/findTargetFile"

export interface ICreateFileProps {
  newFileName: string
  onError: (error: Error) => void
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
  const {
    data: packageFilesWithContent,
    isLoading: isLoadingPackageFilesWithContent,
  } = usePackageFilesLoader(currentPackage)
  const { data: packageFilesMeta, isLoading: isLoadingPackageFiles } =
    usePackageFiles(currentPackage?.latest_package_release_id)

  const initialCodeContent = useMemo(() => {
    return (
      templateCode ??
      decodeUrlHashToText(window.location.toString()) ??
      DEFAULT_CODE
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
  const createPackageMutation = useCreatePackageMutation()

  useEffect(() => {
    if (!currentPackage || isLoadingPackageFilesWithContent) {
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
  }: ICreateFileProps): ICreateFileResult => {
    newFileName = newFileName.trim()
    if (!newFileName) {
      onError(new Error("File name cannot be empty"))
      return {
        newFileCreated: false,
      }
    }
    if (!isValidFileName(newFileName)) {
      onError(new Error("Invalid file name"))
      return {
        newFileCreated: false,
      }
    }

    const fileExists = localFiles?.some((file) => file.path === newFileName)
    if (fileExists) {
      onError(new Error("File already exists"))
      return {
        newFileCreated: false,
      }
    }
    const updatedFiles = [
      ...(localFiles || []),
      { path: newFileName, content: "" },
    ]
    setLocalFiles(updatedFiles)
    onFileSelect(newFileName)
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
    onFileSelect(updatedFiles[0]?.path || "")
    return {
      fileDeleted: true,
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

    const newPackage = await createPackageMutation.mutateAsync({
      name: `${loggedInUser?.github_username}/${generateRandomPackageName()}`,
      is_private: isPrivate,
    })

    if (newPackage) {
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
            updateLastUpdated()
            setInitialFiles([...localFiles])
          },
        },
      )
    }
    updateLastUpdated()
  }

  const saveFiles = () => {
    if (!isLoggedIn) {
      toast({
        title: "Not Logged In",
        description: "You must be logged in to save your package.",
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
    saveFiles,
    localFiles,
    initialFiles,
    currentFile,
    setLocalFiles,
    onFileSelect,
    isLoading,
    isSaving,
    savePackage,
  }
}
