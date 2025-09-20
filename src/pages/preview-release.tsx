import { useEffect, useState } from "react"
import { useParams } from "wouter"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import Header from "@/components/Header"
import { cn } from "@/lib/utils"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"
import NotFoundPage from "./404"
import { getBuildStatus } from "@/components/preview"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { PackageBuild } from "fake-snippets-api/lib/db/schema"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { RunFrameStaticBuildViewer } from "@tscircuit/runframe/runner"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"

const StatusPill = ({ status }: { status: string }) => {
  const color =
    status === "success"
      ? "bg-emerald-600"
      : status === "failed"
        ? "bg-red-600"
        : status === "building"
          ? "bg-blue-600 animate-pulse"
          : "bg-gray-500"
  return <span className={cn("inline-block w-2 h-2 rounded-full", color)} />
}

const fetchCircuitJson = async (fileRef: {
  filePath: string
  fileStaticAssetUrl: string
}): Promise<object> => {
  const res = await fetch(String(fileRef.fileStaticAssetUrl))
  const resJson = await res.json()
  const circuitJson = JSON.parse(resJson.package_file.content_text)
  console.log(circuitJson)
  return circuitJson
}

export default function PreviewBuildPage() {
  const params = useParams<{
    packageReleaseId: string
    author: string
    packageName: string
  }>()
  const packageReleaseId = params?.packageReleaseId || null
  const author = params?.author || null
  const packageName = params?.packageName || null

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  const apiUrl = useApiBaseUrl()
  const { data: packageRelease, isLoading: isLoadingRelease } =
    usePackageReleaseById(packageReleaseId)
  const { data: pkg, isLoading: isLoadingPackage } = usePackageByName(
    author && packageName ? `${author}/${packageName}` : null,
  )
  const { data: build, isLoading: isLoadingBuild } = usePackageBuild(
    packageRelease?.latest_package_build_id || null,
  )

  const isLoading = isLoadingRelease || isLoadingPackage || isLoadingBuild

  if (!packageReleaseId) {
    return <NotFoundPage heading="Package Release Not Found" />
  }

  if (!packageRelease && !isLoadingRelease) {
    return <NotFoundPage heading="Package Release Not Found" />
  }
  const { status } = getBuildStatus(build as PackageBuild)

  return (
    <>
      <Header />
      <div className="flex flex-col h-screen overflow-hidden  !-mt-1">
        <div className="flex flex-1 overflow-hidden">
          <aside
            className={cn(
              "relative border-r border-gray-200 rounded-r-lg z-[5] h-full transition-all duration-300 ease-in-out bg-white",
              sidebarCollapsed ? "w-2 md:w-3" : "w-80",
            )}
          >
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute top-4 -right-3 z-10 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            {!sidebarCollapsed && (
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Deployment
                    </h2>
                    <StatusPill status={status} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        ID
                      </span>
                      <PrefetchPageLink
                        href={`/${pkg?.name}/releases/${build?.package_release_id}`}
                        title={build?.package_build_id}
                        className="font-mono text-sm truncate text-gray-900 bg-gray-100 w-full px-2 py-1 rounded"
                      >
                        {build?.package_build_id}
                      </PrefetchPageLink>
                    </div>
                    {packageRelease?.commit_message && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Commit
                        </span>
                        <a
                          title={packageRelease?.commit_message}
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://github.com/${pkg?.github_repo_full_name}/commit/${packageRelease?.commit_message}`}
                          className="font-mono text-xs text-gray-600 bg-gray-50 px-2 text-right py-1 rounded truncate"
                        >
                          {packageRelease?.commit_message}
                        </a>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 w-fit rounded-full capitalize ${
                          status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : status === "error"
                              ? "bg-red-100 text-red-800"
                              : status === "building"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div className="flex flex-col h-full overflow-h-hidden">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p>Loading package contents...</p>
                  </div>
                </div>
              ) : status === "success" ? (
                <RunFrameStaticBuildViewer
                  files={[
                    {
                      filePath: "dist/circuit.json",
                      fileStaticAssetUrl: `${apiUrl}/package_files/get?file_path=dist/circuit.json&package_release_id=${build?.package_release_id}`,
                    },
                  ]}
                  onFetchFile={fetchCircuitJson as any}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  {status === "building" ? (
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <p>Building…</p>
                    </div>
                  ) : status === "error" ? (
                    <div className="text-center">
                      <p className="text-red-600 font-medium mb-2">
                        Build Failed
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-gray-600 font-medium mb-2">
                        Build Status: {status}
                      </p>
                      <p className="text-sm text-gray-500 max-w-lg">
                        Please wait while we process this build status. Try
                        refreshing the page in a few moments.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
