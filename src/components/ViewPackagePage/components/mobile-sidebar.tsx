import { GitFork, Star, Tag, Settings, LinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { usePreviewImages } from "@/hooks/use-preview-images"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Button } from "@/components/ui/button"
import { useEditPackageDetailsDialog } from "@/components/dialogs/edit-package-details-dialog"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { usePackageFileById, usePackageFiles } from "@/hooks/use-package-files"
import { getLicenseFromLicenseContent } from "@/lib/getLicenseFromLicenseContent"

interface MobileSidebarProps {
  isLoading?: boolean
  onViewChange: (view: "schematic" | "pcb" | "3d") => void
}

const MobileSidebar = ({
  isLoading = false,
  onViewChange,
}: MobileSidebarProps) => {
  const { packageInfo, refetch: refetchPackageInfo } = useCurrentPackageInfo()
  const { data: releaseFiles } = usePackageFiles(
    packageInfo?.latest_package_release_id,
  )
  const licenseFileId = useMemo(() => {
    return (
      releaseFiles?.find((f) => f.file_path === "LICENSE")?.package_file_id ||
      null
    )
  }, [releaseFiles])
  const { data: licenseFileMeta } = usePackageFileById(licenseFileId)
  const currentLicense = useMemo(() => {
    if (packageInfo?.latest_license) {
      return packageInfo?.latest_license
    }
    if (licenseFileMeta?.content_text) {
      return getLicenseFromLicenseContent(licenseFileMeta.content_text)
    }
    return undefined
  }, [licenseFileMeta, packageInfo?.latest_license])
  const topics = useMemo(
    () => (packageInfo?.is_package ? ["Package"] : ["Board"]),
    [packageInfo?.is_package],
  )
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const isOwner =
    isLoggedIn &&
    packageInfo?.owner_github_username ===
      useGlobalStore((s) => s.session?.github_username)

  const {
    Dialog: EditPackageDetailsDialog,
    openDialog: openEditPackageDetailsDialog,
  } = useEditPackageDetailsDialog()

  const [localDescription, setLocalDescription] = useState<string>("")
  const [localWebsite, setLocalWebsite] = useState<string>("")

  useEffect(() => {
    if (packageInfo) {
      setLocalDescription(
        packageInfo.description || packageInfo.ai_description || "",
      )
      setLocalWebsite((packageInfo as any)?.website || "")
    }
  }, [packageInfo])

  const handlePackageUpdate = useCallback(
    (newDescription: string, newWebsite: string) => {
      setLocalDescription(newDescription)
      setLocalWebsite(newWebsite)
      refetchPackageInfo()
    },
    [refetchPackageInfo],
  )

  const { availableViews } = usePreviewImages({
    packageName: packageInfo?.name,
    fsMapHash: packageInfo?.latest_package_release_fs_sha ?? "",
  })

  const handleViewClick = useCallback(
    (viewId: string) => {
      onViewChange?.(viewId as "3d" | "pcb" | "schematic")
    },
    [onViewChange],
  )

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] md:hidden">
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] md:hidden">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm text-gray-700 dark:text-[#c9d1d9]">
          {localDescription ||
            packageInfo?.description ||
            packageInfo?.ai_description ||
            ""}
        </p>
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 ml-2 flex-shrink-0"
            onClick={openEditPackageDetailsDialog}
            title="Edit package details"
          >
            <Settings className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </div>

      {localWebsite && (
        <a
          href={localWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium dark:text-[#58a6ff] hover:underline text-sm flex items-center mb-4 max-w-full overflow-hidden"
        >
          <LinkIcon className="h-4 w-4 min-w-[16px] mr-1 flex-shrink-0" />
          <span className="truncate">{localWebsite}</span>
        </a>
      )}

      {/* Tags/Topics */}
      <div className="flex flex-wrap gap-2 mb-4">
        {topics.map((topic, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-xs rounded-full px-2 py-0.5 bg-blue-100 dark:bg-[#1f6feb33] text-blue-600 dark:text-[#58a6ff] border-blue-300 dark:border-[#1f6feb66]"
          >
            {topic}
          </Badge>
        ))}
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span className="mr-4">
            {packageInfo ? (
              `${packageInfo.star_count} stars`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
        <div className="flex items-center">
          <GitFork className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span className="mr-4">
            {packageInfo ? (
              `${(packageInfo as any).fork_count ?? 0} forks`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span>
            {packageInfo ? (
              `v${packageInfo.latest_version || "-"}`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {availableViews.map((view) => (
          <PreviewButton
            key={view.id}
            view={view.label}
            onClick={() => handleViewClick(view.id)}
            imageUrl={view.imageUrl}
            status={view.status}
            onLoad={view.onLoad}
            onError={view.onError}
          />
        ))}
      </div>
      {packageInfo && (
        <EditPackageDetailsDialog
          currentAllowPrPreviews={packageInfo.allow_pr_previews}
          packageReleaseId={packageInfo.latest_package_release_id}
          packageId={packageInfo.package_id}
          currentDescription={
            packageInfo.description || packageInfo?.ai_description || ""
          }
          currentGithubRepoFullName={packageInfo.github_repo_full_name}
          currentLicense={currentLicense}
          currentWebsite={(packageInfo as any)?.website || ""}
          isPrivate={Boolean(packageInfo.is_private)}
          packageAuthor={packageInfo.owner_github_username}
          onUpdate={handlePackageUpdate}
          packageName={packageInfo.name}
          unscopedPackageName={packageInfo.unscoped_name}
          currentDefaultView={packageInfo.default_view}
        />
      )}
    </div>
  )
}

export default React.memo(MobileSidebar)

function PreviewButton({
  view,
  onClick,
  imageUrl,
  status,
  onLoad,
  onError,
}: {
  view: string
  onClick: () => void
  imageUrl?: string
  status: "loading" | "loaded" | "error"
  onLoad: () => void
  onError: () => void
}) {
  if (status === "error") {
    return null
  }

  return (
    <button
      onClick={onClick}
      className="aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors mt-4"
    >
      {status === "loading" && (
        <Skeleton className="w-full h-full rounded-lg" />
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={view}
          className={`w-full h-full object-cover rounded-lg ${
            status === "loaded" ? "block" : "hidden"
          }`}
          onLoad={onLoad}
          onError={onError}
        />
      )}
    </button>
  )
}
