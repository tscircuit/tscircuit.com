import React from "react"
import { Link } from "wouter"
import { Package } from "fake-snippets-api/lib/db/schema"
import { StarIcon, LockClosedIcon } from "@radix-ui/react-icons"
import { GlobeIcon, CircuitBoard } from "lucide-react"
import { SnippetType, SnippetTypeIcon } from "./SnippetTypeIcon"
import { timeAgo } from "@/lib/utils/timeAgo"
import { getPackagePreviewImageUrl } from "@/lib/utils/getPackagePreviewImageUrl"

interface PackageSearchCardProps {
  pkg: Package
  showOwner?: boolean
}

export const PackageSearchCard: React.FC<PackageSearchCardProps> = ({
  pkg,
  showOwner = true,
}) => {
  const previewImageUrl = getPackagePreviewImageUrl(
    pkg,
    pkg.default_view as "pcb" | "schematic" | "3d",
  )

  const packageNameWithOwner = pkg?.name
  const packageOwnerName =
    pkg?.org_owner_tscircuit_handle ??
    (packageNameWithOwner?.includes("/")
      ? packageNameWithOwner?.split("/")[0]
      : pkg?.owner_github_username)
  const packageName = packageNameWithOwner?.includes("/")
    ? packageNameWithOwner?.split("/")[1]
    : pkg?.unscoped_name

  return (
    <Link href={`/${pkg.name}`}>
      <div className="my-3 sm:my-4 border rounded-md border-gray-200 py-4 px-3 sm:py-5 sm:px-4 hover:bg-gray-50 transition-colors cursor-pointer">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex-shrink-0 border rounded-md border-gray-200 size-20 sm:size-24 md:size-28 overflow-hidden bg-gray-50 flex items-center justify-center">
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt={`${pkg.unscoped_name} preview`}
                className="object-cover h-full w-full transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                  e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  e.currentTarget.nextElementSibling?.classList.add("flex")
                }}
              />
            ) : null}
            <div
              className={`${previewImageUrl ? "hidden" : "flex"} items-center justify-center h-full w-full`}
            >
              <CircuitBoard className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-blue-600 hover:underline break-words leading-tight">
              {showOwner && packageOwnerName && (
                <>
                  <span className="text-blue-600">{packageOwnerName}</span>
                  <span className="mx-1 text-gray-400">/</span>
                </>
              )}
              <span className="text-blue-600">{packageName}</span>
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 break-words">
              {pkg.description || "No description available"}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <StarIcon className="w-3.5 h-3.5" />
                <span>{pkg.star_count || 0}</span>
              </div>

              {pkg.is_private ? (
                <div className="flex items-center gap-1">
                  <LockClosedIcon className="w-3.5 h-3.5" />
                  <span>Private</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <GlobeIcon className="w-3.5 h-3.5" />
                  <span>Public</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <span>Updated {timeAgo(new Date(pkg.updated_at))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
