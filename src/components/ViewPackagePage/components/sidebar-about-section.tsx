import { Badge } from "@/components/ui/badge"
import { GitFork, Star, Settings, LinkIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Button } from "@/components/ui/button"
import { useEditPackageDetailsDialog } from "@/components/dialogs/edit-package-details-dialog"
import { useState, useEffect, useMemo } from "react"
import { usePackageFile } from "@/hooks/use-package-files"
import { getLicenseFromLicenseContent } from "@/lib/getLicenseFromLicenseContent"

export interface PackageInfo {
  name: string
  unscoped_name: string
  owner_github_username: string
  star_count: string
  description: string
  ai_description: string
  creator_account_id?: string
  owner_org_id?: string
  is_package?: boolean
  website?: string
  license?: string
  package_id?: string
}

interface SidebarAboutSectionProps {
  packageInfo?: PackageInfo
  isLoading?: boolean
}

export default function SidebarAboutSection() {
  const { packageInfo, refetch: refetchPackageInfo } = useCurrentPackageInfo()
  const { data: packageRelease } = usePackageReleaseById(
    packageInfo?.latest_package_release_id,
  )

  const { data: licenseFileMeta, refetch: refetchLicense } = usePackageFile({
    package_release_id: packageInfo?.latest_package_release_id ?? "",
    file_path: "LICENSE",
  })
  const currentLicense = useMemo(() => {
    if (packageInfo?.latest_license) {
      return packageInfo?.latest_license
    }
    if (licenseFileMeta?.content_text) {
      return getLicenseFromLicenseContent(licenseFileMeta?.content_text)
    }
    return null
  }, [licenseFileMeta])
  const topics = packageInfo?.is_package ? ["Package"] : ["Board"]
  const isLoading = !packageInfo || !packageRelease
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const isOwner =
    isLoggedIn &&
    packageInfo?.creator_account_id ===
      useGlobalStore((s) => s.session?.account_id)

  // Local state to store updated values before the query refetches
  const [localDescription, setLocalDescription] = useState<string>("")
  const [localWebsite, setLocalWebsite] = useState<string>("")

  // Update local state when packageInfo changes
  useEffect(() => {
    if (packageInfo) {
      setLocalDescription(
        packageInfo.description || packageInfo.ai_description || "",
      )
      setLocalWebsite((packageInfo as any)?.website || "")
    }
  }, [packageInfo])

  const {
    Dialog: EditPackageDetailsDialog,
    openDialog: openEditPackageDetailsDialog,
  } = useEditPackageDetailsDialog()

  // Handle updates from the dialog
  const handlePackageUpdate = (newDescription: string, newWebsite: string) => {
    // Update local state immediately for a responsive UI
    setLocalDescription(newDescription)
    setLocalWebsite(newWebsite)

    // Refetch the package info to get the updated data from the server
    refetchPackageInfo()
  }

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">About</h2>
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">About</h2>
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={openEditPackageDetailsDialog}
              title="Edit package details"
            >
              <Settings className="h-4 w-4 text-gray-500" />
            </Button>
          )}
        </div>
        <p className="text-sm mb-3">
          {/* Use local state if available, otherwise fall back to packageInfo */}
          {localDescription ||
            packageInfo?.description ||
            packageInfo?.ai_description}
        </p>
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
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <svg
              className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.53.53-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.29.736c-.264.152-.563.231-.868.231h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.53.53-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.29-.736c.263-.15.561-.231.865-.231H7.25V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z"></path>
            </svg>
            <span>{currentLicense ?? "Unset"} license</span>
          </div>

          <div className="flex items-center">
            <Star className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
            <span>{packageInfo?.star_count} stars </span>
          </div>
          <div className="flex items-center">
            <GitFork className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
            <span>{(packageInfo as any)?.fork_count ?? "0"} forks</span>
          </div>
        </div>
      </div>

      {packageInfo && (
        <EditPackageDetailsDialog
          packageReleaseId={packageInfo.latest_package_release_id}
          packageId={packageInfo.package_id}
          currentDescription={
            packageInfo.description || packageInfo?.ai_description || ""
          }
          currentLicense={currentLicense}
          packageAuthor={packageInfo.owner_github_username}
          currentWebsite={(packageInfo as any)?.website || ""}
          onUpdate={handlePackageUpdate}
          packageName={packageInfo.name}
        />
      )}
    </>
  )
}
