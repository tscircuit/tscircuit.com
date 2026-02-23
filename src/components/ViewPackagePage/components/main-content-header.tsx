import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  CodeIcon,
  Copy,
  Check,
  Pencil,
  GitForkIcon,
  DownloadIcon,
  Package2,
  GitPullRequest,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import MainContentViewSelector from "./main-content-view-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { DownloadButtonAndMenu } from "@/components/DownloadButtonAndMenu"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"
import {
  Package,
  PackageFile,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { BuildStatusBadge } from "./build-status-badge"
import { useDownloadZip } from "@/hooks/use-download-zip"
import { useToast } from "@/hooks/use-toast"
import ReleaseVersionSelector from "./release-version-selector"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { isVersionOlderByTime } from "@/lib/utils/isVersionOlderByTime"

interface MainContentHeaderProps {
  packageFiles: PackageFile[]
  activeView: string
  onViewChange: (view: string) => void
  onExportClicked?: (exportType: string) => void
  packageInfo?: Package
  currentVersion?: string | null
  latestVersion?: string
  onVersionChange?: (version: string, releaseId: string) => void
  packageRelease?: PublicPackageRelease
}

export default function MainContentHeader({
  packageFiles,
  activeView,
  onViewChange,
  packageInfo,
  currentVersion,
  latestVersion,
  onVersionChange,
  packageRelease,
}: MainContentHeaderProps) {
  const [copyInstallState, setCopyInstallState] = useState<"copy" | "copied">(
    "copy",
  )
  const [copyCloneState, setCopyCloneState] = useState<"copy" | "copied">(
    "copy",
  )

  const handleCopyInstall = () => {
    const command = `tsci add ${packageInfo?.name || "@tscircuit/keyboard-default60"}`
    navigator.clipboard.writeText(command)
    setCopyInstallState("copied")
    setTimeout(() => setCopyInstallState("copy"), 2000)
  }

  const handleCopyClone = () => {
    const command = `tsci clone ${packageInfo?.name || "@tscircuit/keyboard-default60"}`
    navigator.clipboard.writeText(command)
    setCopyCloneState("copied")
    setTimeout(() => setCopyCloneState("copy"), 2000)
  }

  const { downloadZip } = useDownloadZip()
  const { toastLibrary } = useToast()

  const handleDownloadZip = () => {
    if (packageInfo && packageFiles) {
      toastLibrary.promise(downloadZip(packageInfo, packageFiles), {
        loading: "Downloading ZIP...",
        success: "ZIP downloaded successfully!",
        error: "Failed to download ZIP",
      })
    }
  }

  const { circuitJson } = useCurrentPackageCircuitJson()
  const { data: allReleases, isLoading: isAllReleasesLoading } =
    usePackageReleasesByPackageId(packageInfo?.package_id ?? null)

  const isViewingOlderVersion =
    currentVersion &&
    latestVersion &&
    currentVersion !== latestVersion &&
    isVersionOlderByTime(currentVersion, latestVersion, allReleases || [])

  return (
    <div className="flex flex-col gap-2 mb-4">
      {((onVersionChange && packageInfo?.package_id) || packageRelease) && (
        <div className="flex items-center gap-2 w-full md:hidden">
          {onVersionChange && packageInfo?.package_id && (
            <div className="flex-1 min-w-0">
              <ReleaseVersionSelector
                allReleases={allReleases}
                isAllReleasesLoading={isAllReleasesLoading}
                currentVersion={currentVersion || null}
                onVersionChange={onVersionChange}
                latestVersion={latestVersion}
              />
            </div>
          )}
          {packageRelease && (
            <BuildStatusBadge packageRelease={packageRelease} />
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {onVersionChange && packageInfo?.package_id && (
            <div className="hidden md:block">
              <ReleaseVersionSelector
                allReleases={allReleases}
                isAllReleasesLoading={isAllReleasesLoading}
                currentVersion={currentVersion || null}
                onVersionChange={onVersionChange}
                latestVersion={latestVersion}
              />
            </div>
          )}
          <MainContentViewSelector
            activeView={activeView}
            onViewChange={onViewChange}
          />
          {packageRelease && (
            <div className="hidden md:block">
              <BuildStatusBadge packageRelease={packageRelease} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DownloadButtonAndMenu
            unscopedName={packageInfo?.unscoped_name}
            desiredImageType={activeView}
            author={packageInfo?.owner_github_username ?? undefined}
            circuitJson={circuitJson}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 dark:bg-[#238636] dark:hover:bg-[#2ea043] text-white"
              >
                <CodeIcon className="h-4 w-4 mr-1.5" />
                Code
                <ChevronDown className="h-4 w-4 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 relative z-[101]">
              <DropdownMenuItem disabled={!Boolean(packageInfo)} asChild>
                <a
                  href={`/editor?package_id=${packageInfo?.package_id}${currentVersion && currentVersion !== latestVersion ? `&version=${currentVersion}` : ""}`}
                  className="cursor-pointer px-2 py-3"
                >
                  <Pencil className="h-4 w-4 mx-3" />
                  Edit Online
                  {isViewingOlderVersion && (
                    <span className="ml-1 text-xs text-amber-600">
                      (v{currentVersion})
                    </span>
                  )}
                </a>
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!Boolean(packageInfo)}
                onClick={handleDownloadZip}
                className="cursor-pointer px-2 py-3"
              >
                <Package2 className="h-4 w-4 mx-3" />
                Download ZIP
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <div className="p-2">
                <div className="text-sm font-medium mb-4 flex items-center">
                  <DownloadIcon className="h-4 w-4 inline-block mr-1.5" />
                  Install
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-[#161b22] rounded-md p-2 text-xs font-mono">
                  <code className="flex-1 overflow-x-auto">
                    tsci add{" "}
                    {packageInfo?.name || "@tscircuit/keyboard-default60"}
                  </code>
                  <button
                    className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-[#30363d] rounded"
                    onClick={handleCopyInstall}
                  >
                    {copyInstallState === "copy" ? (
                      <Copy className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2">
                <div className="text-sm font-medium mb-4 flex items-center">
                  <GitForkIcon className="h-4 w-4 inline-block mr-1.5" />
                  Clone
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-[#161b22] rounded-md p-2 text-xs font-mono">
                  <code className="flex-1 overflow-x-auto">
                    tsci clone{" "}
                    {packageInfo?.name || "@tscircuit/keyboard-default60"}
                  </code>
                  <button
                    className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-[#30363d] rounded"
                    onClick={handleCopyClone}
                  >
                    {copyCloneState === "copy" ? (
                      <Copy className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {packageRelease &&
        (packageRelease.is_pr_preview ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {packageRelease.github_pr_number &&
                packageInfo?.github_repo_full_name ? (
                  <a
                    href={`https://github.com/${packageInfo.github_repo_full_name}/pull/${packageRelease.github_pr_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start cursor-pointer px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-purple-700 dark:text-purple-400 flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                  >
                    <GitPullRequest className="h-3 w-3" />
                    <span>PR Preview</span>
                    <span>#{packageRelease.github_pr_number}</span>
                  </a>
                ) : (
                  <div className="self-start cursor-pointer px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <GitPullRequest className="h-3 w-3" />
                    <span>PR Preview</span>
                    {packageRelease.github_pr_number && (
                      <span>#{packageRelease.github_pr_number}</span>
                    )}
                  </div>
                )}
              </TooltipTrigger>
              {packageRelease.github_pr_title && (
                <TooltipContent>
                  <p>{packageRelease.github_pr_title}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : isViewingOlderVersion && onVersionChange ? (
          <button
            onClick={() => onVersionChange(latestVersion!, "")}
            className="self-start px-2 py-1 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          >
            Viewing older version.{" "}
            <span className="underline">Switch to latest</span>
          </button>
        ) : null)}
    </div>
  )
}
