import { useCreatePackageFilesMutation } from "@/hooks/use-create-package-files-mutation"
import { useCreatePackageMutation } from "@/hooks/use-create-package-mutation"
import { useCreatePackageReleaseMutation } from "@/hooks/use-create-package-release-mutation"
import { usePackageById } from "@/hooks/use-package-by-package-id"
import { usePackageFile } from "@/hooks/use-package-files"
import { usePackageRelease } from "@/hooks/use-package-release"
import { useState } from "react"

export const BetaPage = () => {
  const [createdPackageId, setCreatedPackageId] = useState<string | null>(null)
  const [createdReleaseId, setCreatedReleaseId] = useState<string | null>(null)
  const [createdFileId, setCreatedFileId] = useState<string | null>(null)

  // Demo data
  const demoData = {
    package: {
      name: "@testuser/test-package",
      description: "Test package",
      is_private: false,
    },
    release: {
      version: "1.0.0",
      is_latest: true,
    },
    file: {
      file_path: "src/index.ts",
      content_text: 'export const hello = () => console.log("Hello!");',
      content_mimetype: "text/typescript",
    },
  }

  // Mutations and queries
  const { mutate: createPackage, isLoading: isCreatingPackage } =
    useCreatePackageMutation({
      onSuccess: (pkg) => setCreatedPackageId(pkg.package_id),
    })
  const { mutate: createRelease, isLoading: isCreatingRelease } =
    useCreatePackageReleaseMutation({
      onSuccess: (release) => setCreatedReleaseId(release.package_release_id),
    })
  const { mutate: createFile, isLoading: isCreatingFile } =
    useCreatePackageFilesMutation({
      onSuccess: (file) => setCreatedFileId(file.package_file_id),
    })

  const { data: packageData } = usePackageById(createdPackageId)
  const { data: releaseData } = usePackageRelease(
    createdReleaseId ? { package_release_id: createdReleaseId } : null,
  )
  const { data: fileData } = usePackageFile(
    createdFileId ? { package_file_id: createdFileId } : null,
  )

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Package Management Demo</h1>
      <div className="grid grid-cols-3 gap-4">
        {/* Package Creation */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">1. Create Package</h2>
            <button
              onClick={() => createPackage(demoData.package)}
              disabled={isCreatingPackage || Boolean(createdPackageId)}
              className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {createdPackageId ? "✓" : "Create"}
            </button>
          </div>
          {packageData && (
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(packageData, null, 2)}
            </pre>
          )}
        </div>

        {/* Release Creation */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">2. Create Release</h2>
            <button
              onClick={() =>
                createdPackageId &&
                createRelease({
                  package_id: createdPackageId,
                  ...demoData.release,
                })
              }
              disabled={!createdPackageId || Boolean(createdReleaseId)}
              className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {createdReleaseId ? "✓" : "Create"}
            </button>
          </div>
          {releaseData && (
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(releaseData, null, 2)}
            </pre>
          )}
        </div>

        {/* File Creation */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">3. Create File</h2>
            <button
              onClick={() =>
                createdReleaseId &&
                createFile({
                  package_release_id: createdReleaseId,
                  ...demoData.file,
                })
              }
              disabled={!createdReleaseId || Boolean(createdFileId)}
              className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {createdFileId ? "✓" : "Create"}
            </button>
          </div>
          {fileData && (
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(fileData, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default BetaPage
