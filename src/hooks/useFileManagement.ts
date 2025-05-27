import { useEffect, useMemo, useState } from "react"
import { isValidFileName } from "@/lib/utils/isValidFileName"
import {
  DEFAULT_CODE,
  PackageFile,
} from "../components/package-port/CodeAndPreview"
import { Package } from "fake-snippets-api/lib/db/schema"
import { usePackageFileById, usePackageFiles } from "./use-package-files"
import { decodeUrlHashToText } from "@/lib/decodeUrlHashToText"


export interface ICreateFileProps  {
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
  onError,
  templateCode,  
  currentPackage
}: {
  onError: (error: Error) => void
  templateCode?: string
  currentPackage?: Package
}) {
  const {data: packageFiles, isLoading: isLoadingPackageFiles} = usePackageFiles(currentPackage?.latest_package_release_id)
  const [localFiles, setLocalFiles] = useState<PackageFile[]>([])
  const [initialFiles, setInitialFiles] = useState<PackageFile[]>([])
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const manualEditsFileContent = packageFiles?.find(
    (file) => file.file_path === "manual-edits.json",
  )?.content_text || "{}"

  const indexFileFromHook = usePackageFileById(
    packageFiles?.find((x) => x.file_path === "index.tsx")?.package_file_id ??
      null,
  )

  const initialCodeContent = useMemo(() => {
    if (indexFileFromHook.data?.content_text)
      return indexFileFromHook.data.content_text
    return (
      templateCode ??
      decodeUrlHashToText(window.location.toString()) ??
      (currentPackage ? "" : DEFAULT_CODE)
    )
  }, [indexFileFromHook.data, templateCode, currentPackage])


  useEffect(() => {
    if(!currentPackage) {
      setLocalFiles([
        {
          path: "index.tsx",
          content: initialCodeContent,
        }
      ])
      setInitialFiles([
        {
          path: "index.tsx",
          content: initialCodeContent,
        }
      ])
      setCurrentFile("index.tsx")
      return
    } else {
      setLocalFiles(packageFiles?.map((file) => ({
        path: file.file_path,
        content: file.content_text || "",
      })) || [])
    setInitialFiles(packageFiles?.map((file) => ({
      path: file.file_path,
        content: file.content_text || "",
      })) || [])
      setCurrentFile(packageFiles?.[0].file_path || null)
    }
  }, [packageFiles, currentPackage])

  const isLoading = useMemo(() => {
    return isLoadingPackageFiles || !localFiles
  }, [isLoadingPackageFiles, localFiles])

  const fsMap  = useMemo(() => {
    if (!localFiles) return {}
    const map = localFiles.reduce((acc, file) => {
      if (file.content) {
        acc[file.path] = file.content
      }
      return acc
    }, {} as Record<string, string>)
    map["manual-edits.json"] = manualEditsFileContent
    
    return map
  }, [localFiles, manualEditsFileContent])

  const onFileSelect = (fileName: string) => {
    setCurrentFile(fileName)
  }

  const createFile = ({
    newFileName,
    onError
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

    const fileExists = localFiles?.some(
      (file) => file.path === newFileName,
    )
    if (fileExists) {
      onError(new Error("File already exists"))
      return {
        newFileCreated: false,
      }
    }
    
    const updatedFiles = [...(localFiles || []), { path: newFileName, content: "" }]
    setLocalFiles(updatedFiles)
    onFileSelect(newFileName)
    return {
      newFileCreated: true,
    }
  }

  const deleteFile = ({ filename, onError }: IDeleteFileProps): IDeleteFileResult => {
    const fileExists = localFiles?.some(
      (file) => file.path === filename,
    )
    if (!fileExists) {
      onError(new Error("File does not exist"))   
      return {
        fileDeleted: false,
      }
    }

    const updatedFiles = localFiles.filter(
      (file) => file.path !== filename,
    )
    setLocalFiles(updatedFiles)

    return {
      fileDeleted: true,
    }
  }

  const saveFiles = () => {
    console.log("saveFiles", localFiles)
  }

  // const handleCreateFile = async ({
  //   newFileName,
  //   setErrorMessage,
  //   onFileSelect,
  //   setNewFileName,
  //   setIsCreatingFile,
  // }: CreateFileProps) => {
  //   newFileName = newFileName.trim()
  //   if (!newFileName) {
  //     setErrorMessage("File name cannot be empty")
  //     return
  //   }
  //   if (!isValidFileName(newFileName)) {
  //     setErrorMessage(
  //       'Invalid file name. Avoid using special characters like <>:"/\\|?*',
  //     )
  //     return
  //   }
  //   setErrorMessage("")

  //   const fileExists = packageFilesWithContent.some(
  //     (file) => file.path === newFileName,
  //   )

  //   if (fileExists) {
  //     setErrorMessage("A file with this name already exists")
  //     return
  //   }

  //   setCodeAndPreviewState((prev) => {
  //     const updatedFiles = [
  //       ...prev.pkgFilesWithContent,
  //       { path: newFileName, content: "" },
  //     ]
  //     return {
  //       ...prev,
  //       pkgFilesWithContent: updatedFiles,
  //     } as CodeAndPreviewState
  //   })
  //   onFileSelect(newFileName)
  //   setIsCreatingFile(false)
  //   setNewFileName("")
  // }

  // const handleDeleteFile = async ({ filename }: DeleteFileProps) => {
  //   const fileExists = packageFilesWithContent.some(
  //     (file) => file.path === filename,
  //   )

  //   if (!fileExists) {
  //     toast({
  //       title: "A file with this name doesn't exist",
  //       variant: "destructive",
  //     })
  //     return
  //   }

  //   setCodeAndPreviewState((prev) => {
  //     const updatedFiles = prev.pkgFilesWithContent.filter(
  //       (file) => file.path !== filename,
  //     )
  //     return {
  //       ...prev,
  //       pkgFilesWithContent: updatedFiles,
  //       currentFile:
  //         updatedFiles.find((file) => file.path === prev.currentFile)?.path ||
  //         "",
  //     }
  //   })
  // }

  // const handleSave = async () => {
  //   if (!isLoggedIn) {
  //     toast({
  //       title: "Not Logged In",
  //       description: "You must be logged in to save your package.",
  //       variant: "destructive",
  //     })
  //     return
  //   }

  //   if (!pkg) {
  //     openNewPackageSaveDialog()
  //     return
  //   }

  //   setCodeAndPreviewState((prev) => ({ ...prev, lastSavedAt: Date.now() }))

  //   if (pkg) {
  //     updatePackageFilesMutation.mutate(
  //       {
  //         package_name_with_version: `${pkg.name}@latest`,
  //         ...pkg,
  //       },
  //       {
  //         onSuccess: () => {
  //           setCodeAndPreviewState((prev) => ({
  //             ...prev,
  //             initiallyLoadedFiles: [...prev.pkgFilesWithContent],
  //           }))
  //           refetchPackageFiles()
  //         },
  //       },
  //     )
  //   }
  // }

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
    isLoading
  }
}


// export function useFileManagement2({
//   setCodeAndPreviewState,
//   pkg,
//   updatePackageFilesMutation,
//   openNewPackageSaveDialog,
//   refetchPackageFiles,
//   manualEditsFileContent,
//   packageFilesWithContent,
// }: {
//   setCodeAndPreviewState: Dispatch<SetStateAction<CodeAndPreviewState>>
//   pkg: Package | undefined
//   updatePackageFilesMutation: UseMutationResult<any, Error, any, any>
//   openNewPackageSaveDialog: () => void
//   refetchPackageFiles: () => void
//   manualEditsFileContent: string
//   packageFilesWithContent: PackageFile[]
// }) {
//   const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
//   const { toast } = useToast()

//   const handleCreateFile = async ({
//     newFileName,
//     setErrorMessage,
//     onFileSelect,
//     setNewFileName,
//     setIsCreatingFile,
//   }: CreateFileProps) => {
//     newFileName = newFileName.trim()
//     if (!newFileName) {
//       setErrorMessage("File name cannot be empty")
//       return
//     }
//     if (!isValidFileName(newFileName)) {
//       setErrorMessage(
//         'Invalid file name. Avoid using special characters like <>:"/\\|?*',
//       )
//       return
//     }
//     setErrorMessage("")

//     const fileExists = packageFilesWithContent.some(
//       (file) => file.path === newFileName,
//     )

//     if (fileExists) {
//       setErrorMessage("A file with this name already exists")
//       return
//     }

//     setCodeAndPreviewState((prev) => {
//       const updatedFiles = [
//         ...prev.pkgFilesWithContent,
//         { path: newFileName, content: "" },
//       ]
//       return {
//         ...prev,
//         pkgFilesWithContent: updatedFiles,
//       } as CodeAndPreviewState
//     })
//     onFileSelect(newFileName)
//     setIsCreatingFile(false)
//     setNewFileName("")
//   }

//   const handleDeleteFile = async ({ filename }: DeleteFileProps) => {
//     const fileExists = packageFilesWithContent.some(
//       (file) => file.path === filename,
//     )

//     if (!fileExists) {
//       toast({
//         title: "A file with this name doesn't exist",
//         variant: "destructive",
//       })
//       return
//     }

//     setCodeAndPreviewState((prev) => {
//       const updatedFiles = prev.pkgFilesWithContent.filter(
//         (file) => file.path !== filename,
//       )
//       return {
//         ...prev,
//         pkgFilesWithContent: updatedFiles,
//         currentFile:
//           updatedFiles.find((file) => file.path === prev.currentFile)?.path ||
//           "",
//       }
//     })
//   }

//   const handleSave = async () => {
//     if (!isLoggedIn) {
//       toast({
//         title: "Not Logged In",
//         description: "You must be logged in to save your package.",
//         variant: "destructive",
//       })
//       return
//     }

//     if (!pkg) {
//       openNewPackageSaveDialog()
//       return
//     }

//     setCodeAndPreviewState((prev) => ({ ...prev, lastSavedAt: Date.now() }))

//     if (pkg) {
//       updatePackageFilesMutation.mutate(
//         {
//           package_name_with_version: `${pkg.name}@latest`,
//           ...pkg,
//         },
//         {
//           onSuccess: () => {
//             setCodeAndPreviewState((prev) => ({
//               ...prev,
//               initiallyLoadedFiles: [...prev.pkgFilesWithContent],
//             }))
//             refetchPackageFiles()
//           },
//         },
//       )
//     }
//   }

//   const fsMap = useMemo(() => {
//     return {
//       "manual-edits.json": manualEditsFileContent || "{}",
//       ...packageFilesWithContent.reduce(
//         (acc, file) => {
//           acc[file.path] = file.content
//           return acc
//         },
//         {} as Record<string, string>,
//       ),
//     }
//   }, [manualEditsFileContent, packageFilesWithContent])

//   return {
//     handleCreateFile,
//     handleDeleteFile,
//     handleSave,
//     fsMap,
//   }
// }
