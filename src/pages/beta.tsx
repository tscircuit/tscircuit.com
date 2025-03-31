import { useCreatePackageFilesMutation } from "@/hooks/use-create-package-files-mutation"
import { useCreatePackageMutation } from "@/hooks/use-create-package-mutation"
import { useCreatePackageReleaseMutation } from "@/hooks/use-create-package-release-mutation"
import { useForkPackageMutation } from "@/hooks/use-fork-package-mutation"
import { usePackageById } from "@/hooks/use-package-by-package-id"
import { usePackageFile } from "@/hooks/use-package-files"
import { usePackageRelease } from "@/hooks/use-package-release"
import { useState } from "react"

export const BetaPage = () => {
  const [createdPackageId, setCreatedPackageId] = useState<string | null>(null)
  const [createdReleaseId, setCreatedReleaseId] = useState<string | null>(null)
  const [createdFileId, setCreatedFileId] = useState<string | null>(null)
  const [forkedPackageId, setForkedPackageId] = useState<string | null>(null)
  const [packageName, setPackageName] = useState("")

  // Demo data
  const demoData = {
    package: {
      name: packageName,
      description: "Test package",
      is_private: false,
    },
    release: {
      version: "1.0.0",
      is_latest: true,
    },
    files: [
      {
        file_path: "src/index.ts",
        content_text: 'export const hello = () => console.log("Hello!");',
      },
      {
        file_path: "src/utils.ts",
        content_text: "export const add = (a: number, b: number) => a + b;",
      },
      {
        file_path: "README.md",
        content_text: "# Test Package\n\nA test package with multiple files.",
      },
    ],
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
  const { mutate: forkPackage, isLoading: isForking } = useForkPackageMutation({
    onSuccess: (forkedPackage) => setForkedPackageId(forkedPackage.package_id),
  })

  const { data: packageData } = usePackageById(createdPackageId)
  const { data: releaseData } = usePackageRelease(
    createdReleaseId ? { package_release_id: createdReleaseId } : null,
  )
  const { data: fileData } = usePackageFile(
    createdFileId ? { package_file_id: createdFileId } : null,
  )
  const { data: forkedPackageData } = usePackageById(forkedPackageId)

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Package Management Demo</h1>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            placeholder="test-package"
            className="flex-1 px-3 py-2 border rounded text-sm"
            disabled={Boolean(createdPackageId)}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {/* Package Creation */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">1. Create Package</h2>
            <button
              onClick={() => createPackage(demoData.package)}
              disabled={
                isCreatingPackage || Boolean(createdPackageId) || !packageName
              }
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
            <h2 className="font-semibold">3. Create Files</h2>
            <button
              onClick={() =>
                createdReleaseId &&
                Promise.all(
                  demoData.files.map((file) =>
                    createFile({
                      package_release_id: createdReleaseId,
                      ...file,
                    }),
                  ),
                )
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

        {/* Fork Package */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">4. Fork Package</h2>
            <button
              onClick={() => createdPackageId && forkPackage(createdPackageId)}
              disabled={!createdPackageId || isForking}
              className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {forkedPackageId ? "✓" : "Fork"}
            </button>
          </div>
          {forkedPackageData && (
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(forkedPackageData, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default BetaPage
