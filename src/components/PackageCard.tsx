import React from "react"
import { Link } from "wouter"
import { Package } from "fake-snippets-api/lib/db/schema"
import { StarIcon, LockClosedIcon } from "@radix-ui/react-icons"
import {
  GlobeIcon,
  MoreVertical,
  PencilIcon,
  Share2,
  Trash2,
  CircuitBoard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SnippetType, SnippetTypeIcon } from "./SnippetTypeIcon"
import { timeAgo } from "@/lib/utils/timeAgo"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { getPackagePreviewImageUrl } from "@/lib/utils/getPackagePreviewImageUrl"

export interface PackageCardProps {
  /** The package data to display */
  pkg: Package
  /** Whether to show the owner name (useful in starred views) */
  showOwner?: boolean
  /** Whether this is the current user's package (enables edit/delete options) */
  isCurrentUserPackage?: boolean
  /** Callback when delete is clicked */
  onDeleteClick?: (e: React.MouseEvent, pkg: Package) => void
  /** Custom class name for the card container */
  className?: string
  /** Custom image size (default is h-16 w-16) */
  imageSize?: string
  /** Custom image transform style */
  imageTransform?: string
  /** Whether to render the card with a link to the package page */
  withLink?: boolean
  /** Custom render function for actions */
  renderActions?: (pkg: Package) => React.ReactNode
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  showOwner = false,
  isCurrentUserPackage = false,
  onDeleteClick,
  className = "",
  imageSize = "h-16 w-16",
  imageTransform = "transition-transform duration-300 -rotate-45 hover:rotate-0 hover:scale-110 scale-150",
  withLink = true,
  renderActions,
}) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    if (onDeleteClick) {
      onDeleteClick(e, pkg)
    }
  }

  const { copyToClipboard } = useCopyToClipboard()

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const shareUrl = `${window.location.origin}/${pkg.name}`
    copyToClipboard(shareUrl)
  }

  const availableImages = ["pcb", "schematic", "3d"]

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
  const cardContent = (
    <div
      className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 transition-colors ${className}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`${imageSize} flex-shrink-0 rounded-md overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0`}
        >
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt={`${pkg.unscoped_name} ${availableImages.includes(pkg.default_view || "") ? pkg.default_view : "3D"} view`}
              className={`object-cover h-full w-full ${imageTransform}`}
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
            <CircuitBoard className="w-6 h-6 text-gray-300" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-1">
                {showOwner && (
                  <>
                    <span className="text-gray-600">{packageOwnerName}</span>
                    <span className="mx-1 text-gray-400">/</span>
                  </>
                )}
                <span>{packageName}</span>
              </h2>
              <p
                className={`${!pkg.description && "h-5"} text-sm text-gray-600 mb-2 line-clamp-2`}
              >
                {pkg.description || "No description available"}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <SnippetTypeIcon
                type={pkg.snippet_type as SnippetType}
                className="pt-[2.5px]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="text-sm cursor-pointer"
                    onClick={handleShareClick}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Package
                  </DropdownMenuItem>{" "}
                  {isCurrentUserPackage && onDeleteClick && (
                    <DropdownMenuItem
                      className="text-sm text-red-600"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Package
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {renderActions && renderActions(pkg)}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4" />
              <span>{pkg.star_count || 0}</span>
            </div>

            {pkg.is_private ? (
              <div className="flex items-center gap-1">
                <LockClosedIcon height={14} width={14} />
                <span>Private</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <GlobeIcon height={14} width={14} />
                <span>Public</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <PencilIcon height={14} width={14} />
              <span>Updated {timeAgo(new Date(pkg.updated_at))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (withLink) {
    return (
      <Link key={pkg.package_id} href={`/${pkg.name}`}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
