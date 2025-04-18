import { useMutation } from "react-query"
import type { Package } from "fake-snippets-api/lib/db/schema"

interface PackageFile {
  path: string
  content: string
}

interface UseUpdatePackageFilesMutationProps {
  pkg: Package | undefined
  pkgFilesWithContent: PackageFile[]
  initialFilesLoad: PackageFile[]
  pkgFiles: any
  axios: any
  toast: any
  loadPkgFiles: () => void
}

export function useUpdatePackageFilesMutation({
  pkg,
  pkgFilesWithContent,
  initialFilesLoad,
  pkgFiles,
  axios,
  toast,
  loadPkgFiles,
}: UseUpdatePackageFilesMutationProps) {
  return useMutation({
    mutationFn: async (
      newpackage: Pick<Package, "package_id" | "name"> & {
        package_name_with_version: string
      },
    ) => {
      if (pkg) {
        newpackage = { ...pkg, ...newpackage }
      }
      if (!newpackage) throw new Error("No package to update")

      let updatedFilesCount = 0

      for (const file of pkgFilesWithContent) {
        const initialFile = initialFilesLoad.find((x) => x.path === file.path)
        if (file.content && file.content !== initialFile?.content) {
          const updatePkgFilePayload = {
            package_file_id:
              pkgFiles.data?.find((x: any) => x.file_path === file.path)
                ?.package_file_id ?? null,
            content_text: file.content,
            file_path: file.path,
            package_name_with_version: `${newpackage.name}`,
          }

          const response = await axios.post(
            "/package_files/create_or_update",
            updatePkgFilePayload,
          )

          if (response.status === 200) {
            updatedFilesCount++
          }
        }
      }
      return updatedFilesCount
    },
    onSuccess: (updatedFilesCount) => {
      if (updatedFilesCount) {
        toast({
          title: `Package's ${updatedFilesCount} files saved`,
          description: "Your changes have been saved successfully.",
        })
        loadPkgFiles()
      }
    },
    onError: (error: any) => {
      console.error("Error updating pkg files:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update package files. Please try again.",
        variant: "destructive",
      })
    },
  })
}
