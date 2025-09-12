import React from "react"
import { Link } from "wouter"
import {
  Users,
  Package,
  Globe,
  Lock,
  MoreVertical,
  Share2,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { timeAgo } from "@/lib/utils/timeAgo"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Organization } from "fake-snippets-api/lib/db/schema"

export interface OrganizationCardProps {
  /** The organization data to display */
  organization: Organization
  /** Whether to show member count */
  showMembers?: boolean
  /** Whether to show statistics (packages, members) */
  showStats?: boolean
  /** Callback when the card is clicked */
  onClick?: (org: Organization) => void
  /** Whether this is the current user's organization (enables management options) */
  isCurrentUserOrganization?: boolean
  /** Custom class name for the card container */
  className?: string
  /** Whether to render the card with a link to the organization page */
  withLink?: boolean
  /** Custom render function for actions */
  renderActions?: (org: Organization) => React.ReactNode
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  showMembers = true,
  showStats = true,
  onClick,
  isCurrentUserOrganization = false,
  className = "",
  withLink = true,
  renderActions,
}) => {
  const { copyToClipboard } = useCopyToClipboard()

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick && !withLink) {
      e.preventDefault()
      onClick(organization)
    }
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/${organization.github_handle}`
    copyToClipboard(shareUrl)
  }

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // TODO: Navigate to organization settings
    console.log(
      "Navigate to organization settings:",
      organization.github_handle,
    )
  }

  const cardContent = (
    <div
      className={`border p-4 rounded-md hover:shadow-md transition-shadow flex flex-col gap-4 ${className}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        {/* Organization Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-16 w-16 border-2 border-gray-100">
            <AvatarImage
              src={`https://github.com/${organization.github_handle}.png`}
              alt={`${organization.github_handle} avatar`}
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
              {organization.github_handle
                ?.split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Organization Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="min-w-0 flex-1">
              <h2 className="text-md font-semibold text-gray-900 truncate pr-8">
                {organization.github_handle}
              </h2>
            </div>

            {/* Actions Dropdown */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-xs cursor-pointer"
                    onClick={handleShareClick}
                  >
                    <Share2 className="mr-2 h-3 w-3" />
                    Share Organization
                  </DropdownMenuItem>
                  {isCurrentUserOrganization && (
                    <DropdownMenuItem
                      className="text-xs cursor-pointer"
                      onClick={handleSettingsClick}
                    >
                      <Settings className="mr-2 h-3 w-3" />
                      Organization Settings
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {renderActions && renderActions(organization)}
            </div>
          </div>

          {/* Statistics and Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-1">
            {/* Visibility */}
            <div className="flex items-center gap-1">
              {!organization.is_personal_org ? (
                <>
                  <Globe className="h-3 w-3" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  <span>Private</span>
                </>
              )}
            </div>

            {/* Statistics */}
            {showStats && (
              <>
                {showMembers && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>2 members</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>2 packages</span>
                </div>
              </>
            )}
          </div>

          {/* Created time */}
          <div className="text-xs text-gray-400">
            <span>Created {timeAgo(new Date(organization.created_at))}</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (withLink) {
    return (
      <Link
        key={organization.org_id}
        href={`/${organization.github_handle}`}
        className="block"
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
