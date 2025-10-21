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

  const availableImages = ["pcb", "schematic", "assembly", "3d"]

  const previewImageUrl = getPackagePreviewImageUrl(
    pkg,
    pkg.default_view as "pcb" | "schematic" | "3d",
  )

  const cardContent = (
    <div
      className={`border p-4 rounded-md hover:shadow-md transition-shadow flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`${imageSize} flex-shrink-0 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center`}
        >
          <img
            src={String(previewImageUrl)}
            alt={`${pkg.unscoped_name} ${availableImages.includes(pkg.default_view || "") ? pkg.default_view : "3D"} view`}
            className={`object-cover h-full w-full ${imageTransform}`}
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextElementSibling?.classList.remove("hidden")
              e.currentTarget.nextElementSibling?.classList.add("flex")
            }}
          />
          <div className="hidden items-center justify-center h-full w-full">
            <CircuitBoard className="w-6 h-6 text-gray-300" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-[2px] -mt-[3px]">
            <h2 className="text-md font-semibold truncate pr-[30px]">
              {showOwner && (
                <>
                  <span className="text-gray-700 text-md">
                    {pkg.owner_github_username}
                  </span>
                  <span className="mx-1">/</span>
                </>
              )}
              <span className="text-gray-900">{pkg.unscoped_name}</span>
            </h2>
            <div className="flex items-center gap-2">
              <SnippetTypeIcon
                type={pkg.snippet_type as SnippetType}
                className="pt-[2.5px]"
              />
              <div className="flex items-center gap-1 text-gray-600">
                <StarIcon className="w-4 h-4 pt-[2.5px]" />
                <span className="text-[16px]">{pkg.star_count || 0}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-[1.5rem] w-[1.5rem]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="text-xs cursor-pointer"
                    onClick={handleShareClick}
                  >
                    <Share2 className="mr-2 h-3 w-3" />
                    Share Package
                  </DropdownMenuItem>{" "}
                  {isCurrentUserPackage && onDeleteClick && (
                    <DropdownMenuItem
                      className="text-xs text-red-600"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete Package
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {renderActions && renderActions(pkg)}
            </div>
          </div>
          <p
            className={`${!pkg.description && "h-[1.25rem]"} text-sm text-gray-500 mb-1 truncate max-w-xs`}
          >
            {pkg.description ? pkg.description : " "}
          </p>
          <div className={`flex items-center gap-4`}>
            {pkg.is_private ? (
              <div className="flex items-center text-xs gap-1 text-gray-500">
                <LockClosedIcon height={12} width={12} />
                <span>Private</span>
              </div>
            ) : (
              <div className="flex items-center text-xs gap-1 text-gray-500">
                <GlobeIcon height={12} width={12} />
                <span>Public</span>
              </div>
            )}
            <div className="flex items-center text-xs gap-1 text-gray-500">
              <PencilIcon height={12} width={12} />
              <span>{timeAgo(new Date(pkg.updated_at))}</span>
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
