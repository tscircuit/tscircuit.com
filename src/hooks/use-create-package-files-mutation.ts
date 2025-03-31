import type { PackageFile } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"
import { useAxios } from "./use-axios"

export const useCreatePackageFilesMutation = ({
  onSuccess,
}: { onSuccess?: (packageFile: PackageFile) => void } = {}) => {
  const axios = useAxios()

  return useMutation(
    ["createPackageFiles"],
    async ({
      file_path,
      content_text,
      content_base64,
      content_mimetype,
      package_release_id,
      package_name_with_version,
      is_release_tarball = false,
      npm_pack_output,
    }: {
      file_path: string
      content_text?: string
      content_base64?: string
      content_mimetype?: string
      package_release_id?: string
      package_name_with_version?: string
      is_release_tarball?: boolean
      npm_pack_output?: any
    }) => {
      // Validate that either content_text or content_base64 is provided, but not both
      if ((!content_text && !content_base64) || (content_text && content_base64)) {
        throw new Error("Must provide either content_text or content_base64, but not both")
      }

      // Validate that either package_release_id or package_name_with_version is provided
      if (!package_release_id && !package_name_with_version) {
        throw new Error("Must provide either package_release_id or package_name_with_version")
      }

      const {
        data: { package_file: newPackageFile },
      } = await axios.post("/package_files/create", {
        file_path,
        content_text,
        content_base64,
        content_mimetype,
        package_release_id,
        package_name_with_version,
        is_release_tarball,
        npm_pack_output,
      })

      if (!newPackageFile) {
        throw new Error("Failed to create package file")
      }

      return newPackageFile
    },
    {
      onSuccess: (packageFile: PackageFile) => {
        onSuccess?.(packageFile)
      },
      onError: (error: any) => {
        console.error("Error creating package file:", error)
      },
    }
  )
}
