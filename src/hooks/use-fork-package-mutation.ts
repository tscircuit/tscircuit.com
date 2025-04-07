import {
  Package,
  PackageFile,
  PackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"
import { useAxios } from "./use-axios"
import { useGlobalStore } from "./use-global-store"
import { useToast } from "./use-toast"
import { useCreatePackageMutation } from "./use-create-package-mutation"
import { useCreatePackageReleaseMutation } from "./use-create-package-release-mutation"
import { useCreatePackageFilesMutation } from "./use-create-package-files-mutation"

export const useForkPackageMutation = ({
  onSuccess,
}: {
  onSuccess?: (forkedPackage: Package) => void
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const { toast } = useToast()

  const { mutateAsync: createPackage } = useCreatePackageMutation()
  const { mutateAsync: createRelease } = useCreatePackageReleaseMutation()
  const { mutateAsync: createFile } = useCreatePackageFilesMutation()

  return useMutation(
    ["forkPackage"],
    async (packageId: string) => {
      if (!session) throw new Error("No session")

      // Step 1: Fetch source package data
      const { data: packageData } = await axios.get("/packages/get", {
        params: { package_id: packageId },
      })
      const sourcePackage: Package = packageData.package
      if (!sourcePackage) throw new Error("Source package not found")

      // Step 2: Fetch latest release
      const { data: releaseData } = await axios.post("/package_releases/get", {
        package_release_id: sourcePackage.latest_package_release_id,
      })
      const sourceRelease: PackageRelease = releaseData.package_release
      if (!sourceRelease) throw new Error("Source release not found")

      // Step 3: Fetch all files for the release
      const { data: filesData } = await axios.post("/package_files/list", {
        package_release_id: sourceRelease.package_release_id,
      })
      const sourceFiles: PackageFile[] = filesData.package_files
      if (!sourceFiles?.length) throw new Error("No source files found")

      // Step 4: Create new package
      const newPackage = await createPackage({
        name: `${session.github_username}/${sourcePackage.unscoped_name}`,
        description: `Fork of ${sourcePackage.name}`,
      })

      // Step 5: Create new release
      const newRelease = await createRelease({
        package_id: newPackage.package_id,
        version: sourceRelease.version ?? undefined,
        is_latest: true,
      })

      // Step 6: Create all files
      const newFiles = await Promise.all(
        sourceFiles.map((file: PackageFile) =>
          createFile({
            package_release_id: newRelease.package_release_id,
            file_path: file.file_path,
            content_text: file.content_text ?? undefined,
          }),
        ),
      )

      return {
        package: newPackage,
        release: newRelease,
        files: newFiles,
      }
    },
    {
      onSuccess: (result) => {
        toast({
          title: "Package Forked",
          description: `Successfully forked package to @${session?.github_username}/${result.package.unscoped_name}`,
        })
        onSuccess?.(result.package)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: "Failed to fork package. Please try again.",
          variant: "destructive",
        })
      },
    },
  )
}
