import { useState } from "react"
import { useCreatePackageReleaseMutation } from "./use-create-package-release-mutation"
import { useGlobalStore } from "./use-global-store"
import { useUpdatePackageFilesMutation } from "./useUpdatePackageFilesMutation"
import type { PackageFile } from "@/types/package"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useToast } from "./use-toast"

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
  const { toast } = useToast()
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

  const { mutateAsync: createRelease } = useCreatePackageReleaseMutation({
    onSuccess: () => {
      toast({
        title: "Package release created",
        description: "Your package release has been created successfully.",
      })
    },
  })
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
    // Auto-fill with suggested next version
    const nextVersion = suggestedNextVersion || "0.0.1"
    setVersion(nextVersion)
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

      if (files.length > 0 && currentPackage) {
        try {
          await updatePackageFilesMutation.mutateAsync({
            package_name_with_version: `${currentPackage.name}@${version.trim()}`,
            ...currentPackage,
          })
        } catch (fileError: any) {
          console.error("Error uploading files:", fileError)
          toast({
            title: "Error",
            description: "Failed to upload some files to the release",
          })
        }
      }

      onSuccess?.(result)
      close()
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to create release"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
      })
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
