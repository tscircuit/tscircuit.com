import { useState } from "react"
import { useCreatePackageReleaseMutation } from "./use-create-package-release-mutation"
import { useGlobalStore } from "./use-global-store"
import { toast } from "sonner"
import { useUpdatePackageFilesMutation } from "./useUpdatePackageFilesMutation"
import type { PackageFile } from "@/types/package"
import type { Package } from "fake-snippets-api/lib/db/schema"

interface UseCreateReleaseDialogProps {
  packageId?: string
  packageName?: string
  currentVersion?: string
  onSuccess?: (release: any) => void
  files?: PackageFile[]
  currentPackage?: Package
  packageFilesMeta?: {
    created_at: string
    file_path: string
    package_file_id: string
    package_release_id: string
  }[]
}

export const useCreateReleaseDialog = ({
  packageId,
  packageName,
  currentVersion,
  onSuccess,
  files = [],
  currentPackage,
  packageFilesMeta = [],
}: UseCreateReleaseDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [version, setVersion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggestedNextVersion = currentVersion
    ? (() => {
        const parts = currentVersion.split(".")
        if (parts.length === 3) {
          const [major, minor, patch] = parts.map(Number)
          if (!isNaN(major) && !isNaN(minor) && !isNaN(patch)) {
            return `${major}.${minor}.${patch + 1}`
          }
        }
        return undefined
      })()
    : undefined

  const { mutateAsync: createRelease } = useCreatePackageReleaseMutation()
  const session = useGlobalStore((s) => s.session)

  const updatePackageFilesMutation = useUpdatePackageFilesMutation({
    currentPackage,
    localFiles: files,
    initialFiles: [],
    packageFilesMeta,
  })

  const open = () => {
    setIsOpen(true)
    setError(null)
    setVersion("")
  }

  const close = () => {
    setIsOpen(false)
    setError(null)
    setVersion("")
  }

  const handleCreateRelease = async () => {
    if (!version.trim()) {
      setError("Version is required")
      return
    }

    if (!packageId && !packageName) {
      setError("Package information is missing")
      return
    }

    if (!session) {
      setError("You must be logged in to create a release")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const releaseData: any = {
        version: version.trim(),
        is_latest: true,
      }

      if (packageId) {
        releaseData.package_id = packageId
      } else if (packageName) {
        releaseData.package_name = packageName
      }

      const result = await createRelease(releaseData)

      // Upload files to the release if files are provided
      if (files.length > 0 && currentPackage) {
        try {
          await updatePackageFilesMutation.mutateAsync({
            package_name_with_version: `${currentPackage.name}@${version.trim()}`,
            ...currentPackage,
          })
          toast.success(
            `Release ${version} created and files uploaded successfully!`,
          )
        } catch (fileError: any) {
          console.error("Error uploading files:", fileError)
          toast.success(`Release ${version} created successfully!`)
          toast.error("Failed to upload some files to the release")
        }
      } else {
        toast.success(`Release ${version} created successfully!`)
      }

      onSuccess?.(result)
      close()
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to create release"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isOpen,
    openDialog: open,
    closeDialog: close,
    version,
    setVersion,
    currentVersion,
    suggestedNextVersion,
    isLoading: isLoading || updatePackageFilesMutation.isLoading,
    error,
    handleCreateRelease,
  }
}
