import { useMutation, useQueryClient } from "react-query"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useAxios } from "./use-axios"
import { useToast } from "@/components/ViewPackagePage/hooks/use-toast"
import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"

interface PackageFile {
  path: string
  content: string
}

interface UseUpdatePackageFilesMutationProps {
  currentPackage: Package | undefined
  localFiles: PackageFile[]
  initialFiles: PackageFile[]
  packageFilesMeta: {
    created_at: string
    file_path: string
    package_file_id: string
    package_release_id: string
  }[]
}

export function useUpdatePackageFilesMutation({
  currentPackage,
  localFiles,
  initialFiles,
  packageFilesMeta,
}: UseUpdatePackageFilesMutationProps) {
  const axios = useAxios()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      newPackage: Pick<Package, "package_id" | "name"> & {
        package_name_with_version: string
      },
    ) => {
      if (currentPackage) {
        newPackage = { ...currentPackage, ...newPackage }
      }
      if (!newPackage) throw new Error("No package to update")

      let updatedFilesCount = 0

      for (const file of localFiles) {
        if (isHiddenFile(file.path)) continue
        const initialFile = initialFiles.find((x) => x.path === file.path)
        if (file.content !== initialFile?.content) {
          const updatePkgFilePayload = {
            package_file_id:
              packageFilesMeta.find((x) => x.file_path === file.path)
                ?.package_file_id ?? null,
            content_text: file.content,
            file_path: file.path,
            package_name_with_version: `${newPackage.name}`,
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

      for (const initialFile of initialFiles) {
        const fileStillExists = localFiles.some(
          (x) => x.path === initialFile.path,
        )

        if (!fileStillExists) {
          const fileToDelete = packageFilesMeta.find(
            (x) => x.file_path === initialFile.path,
          )

          if (fileToDelete?.package_file_id) {
            const response = await axios.post("/package_files/delete", {
              package_name_with_version: `${newPackage.name}`,
              file_path: initialFile.path,
            })

            if (response.status === 200) {
              updatedFilesCount++
            }
          }
        }
      }
      return updatedFilesCount
    },
    onSuccess: (updatedFilesCount) => {
      if (updatedFilesCount > 0) {
        toast({
          title: `Package's ${updatedFilesCount} files saved`,
          description: "Your changes have been saved successfully.",
        })
        queryClient.invalidateQueries({
          predicate: (q) => {
            const key = q.queryKey as any
            return (
              Array.isArray(key) &&
              (key[0] === "packageFiles" ||
                key[0] === "packageFile" ||
                key[0] === "priorityPackageFile")
            )
          },
        })
      }
    },
    onError: (error: any) => {
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
