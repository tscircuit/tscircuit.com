import { useCreatePackageFilesMutation } from "@/hooks/use-create-package-files-mutation"
import { useCreatePackageMutation } from "@/hooks/use-create-package-mutation"
import { useCreatePackageReleaseMutation } from "@/hooks/use-create-package-release-mutation"
import { useForkPackageMutation } from "@/hooks/use-fork-package-mutation"
import { usePackageById } from "@/hooks/use-package-by-package-id"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageFile, usePackageFiles } from "@/hooks/use-package-files"
import {
  useLatestPackageRelease,
  usePackageRelease,
  usePackageReleaseByNameAndVersion,
} from "@/hooks/use-package-release"
import { useEffect, useState } from "react"
import { useLocation } from "wouter"

export const BetaPage = () => {
  // Get the current path and extract author/packageName
  const [location] = useLocation()
  const pathParts = location.split("/")
  const author = pathParts[2]
  const urlPackageName = pathParts[3]
  const packageNameWithVersion =
    author && urlPackageName ? `${author}/${urlPackageName}` : null

  // States for package creation flow
  const [createdPackageId, setCreatedPackageId] = useState<string | null>(null)
  const [createdReleaseId, setCreatedReleaseId] = useState<string | null>(null)
  const [createdFileId, setCreatedFileId] = useState<string | null>(null)
  const [forkedPackageId, setForkedPackageId] = useState<string | null>(null)
  const [packageName, setPackageName] = useState("")
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!!packageNameWithVersion)

  // Load existing package if URL params are provided
  const { data: existingPackage, isSuccess: packageLoaded } = usePackageByName(
    packageNameWithVersion,
  )
  // Use the new hook instead of usePackageReleaseByNameAndVersion
  const { data: existingRelease, isSuccess: releaseLoaded } =
    useLatestPackageRelease(existingPackage?.package_id)

  // Log for debugging
  console.log("Location path:", location)
  console.log("Author:", author, "Package:", urlPackageName)
  console.log("Package name with version:", packageNameWithVersion)
  console.log("Existing package:", existingPackage)
  console.log("Existing release:", existingRelease)

  // Set IDs from existing package when they're loaded
  useEffect(() => {
    if (existingPackage) {
      console.log("Setting package ID:", existingPackage.package_id)
      setCreatedPackageId(existingPackage.package_id)
      setPackageName(existingPackage.name)
    }
  }, [existingPackage])

  useEffect(() => {
    if (existingRelease) {
      console.log("Setting release ID:", existingRelease.package_release_id)
      setCreatedReleaseId(existingRelease.package_release_id)

      // Force refetch package files by setting a dummy state to trigger useEffect
      setTimeout(() => {
        console.log("Triggering files refetch...")
        setIsLoading(false)
      }, 500)
    }
  }, [existingRelease])

  // Update loading state
  useEffect(() => {
    if (packageNameWithVersion) {
      if (packageLoaded && releaseLoaded) {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [packageNameWithVersion, packageLoaded, releaseLoaded])

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

  // Package data
  const { data: packageData } = usePackageById(createdPackageId)

  // Package release data
  const { data: releaseData } = useLatestPackageRelease(createdPackageId, null)

  // All package files for the release
  const { data: packageFiles, isLoading: filesLoading } = usePackageFiles(
    createdReleaseId ?? undefined,
  )

  // Log the files data for debugging
  console.log(
    "Package files:",
    packageFiles,
    "createdReleaseId:",
    createdReleaseId,
  )

  // Individual file data when selected
  const { data: selectedFileData } = usePackageFile(
    selectedFileId ? { package_file_id: selectedFileId } : null,
  )

  const { data: forkedPackageData } = usePackageById(forkedPackageId)

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Loading package data...</h2>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        {packageNameWithVersion
          ? `Package: ${packageNameWithVersion}`
          : "Package Management Demo"}
      </h1>
      {!packageNameWithVersion && (
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
      )}

      {/* Package creation UI only shown when not viewing an existing package */}
      {!packageNameWithVersion && (
        <div className="grid grid-cols-4 gap-4 mb-4">
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
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
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
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
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
          </div>

          {/* Fork Package */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">4. Fork Package</h2>
              <button
                onClick={() =>
                  createdPackageId && forkPackage(createdPackageId)
                }
                disabled={!createdPackageId || isForking}
                className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600 disabled:bg-green-300"
              >
                {forkedPackageId ? "✓" : "Fork"}
              </button>
            </div>
            {forkedPackageData && (
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(forkedPackageData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Package info section shown when viewing an existing package */}
      {packageNameWithVersion && packageData && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="font-semibold mb-3">Package Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">ID:</div>
              <div className="text-sm text-gray-700">
                {packageData.package_id}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Name:</div>
              <div className="text-sm text-gray-700">{packageData.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Description:</div>
              <div className="text-sm text-gray-700">
                {packageData.description || "No description"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Visibility:</div>
              <div className="text-sm text-gray-700">
                {packageData.is_private ? "Private" : "Public"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Second row: package data exploration */}
      <div className="grid grid-cols-2 gap-6">
        {/* Package Files List */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-3">Package Files</h2>
          <div className="text-xs text-gray-600 mb-2">
            Release ID: {createdReleaseId || "None"}
          </div>
          {filesLoading ? (
            <div className="text-sm text-gray-500">Loading files...</div>
          ) : packageFiles && packageFiles.length > 0 ? (
            <div className="divide-y">
              {packageFiles.map((file) => (
                <button
                  key={file.package_file_id}
                  onClick={() => setSelectedFileId(file.package_file_id)}
                  className={`text-left w-full py-2 px-1 text-sm hover:bg-gray-50 ${
                    selectedFileId === file.package_file_id ? "bg-blue-50" : ""
                  }`}
                >
                  {file.file_path}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {createdReleaseId
                ? "No files found. Files array length: " +
                  (packageFiles ? packageFiles.length : "undefined")
                : "Create a release and files first"}
            </div>
          )}
        </div>

        {/* Selected File Content */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-3">File Content</h2>
          {selectedFileData ? (
            <div>
              <div className="text-xs text-gray-500 mb-2">
                {selectedFileData.file_path}
              </div>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto border max-h-80">
                {selectedFileData.content_text}
              </pre>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {packageFiles && packageFiles.length > 0
                ? "Select a file to view its content"
                : "Create files first"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BetaPage
