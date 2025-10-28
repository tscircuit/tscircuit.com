import React from "react"
import { Button } from "@/components/ui/button"
import { Building2, Users, Package, Lock, Globe2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Link, useLocation } from "wouter"
import { useOrganization } from "@/hooks/use-organization"
import { GithubAvatarWithFallback } from "../GithubAvatarWithFallback"

interface OrganizationHeaderProps {
  organization: PublicOrgSchema
  isCurrentUserOrganization?: boolean
  className?: string
  showActions?: boolean
}

export const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({
  organization,
  className,
  showActions = true,
}) => {
  const session = useGlobalStore((s) => s.session)
  const [, navigate] = useLocation()
  const canManageOrg =
    organization.user_permissions?.can_manage_org ||
    organization.owner_account_id === session?.account_id

  const { membersCount, packagesCount, isLoading } = useOrganization({
    orgId: organization.org_id,
    orgName: organization.name!,
  })

  const handleSettingsClick = () => {
    navigate(`/${organization.name}/settings`)
  }
  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="container mx-auto px-6 py-6">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            <GithubAvatarWithFallback
              username={organization.github_handle}
              fallback={organization.name}
              className="shadow-sm size-16 md:size-20 lg:size-24"
              fallbackClassName="font-bold text-xl md:text-2xl lg:text-3xl"
              size={300}
            />

            <div>
              <div className="flex flex-col items-center gap-3 mb-3">
                <Link
                  href={`/${organization.name}`}
                  className="font-bold text-gray-900 text-xl"
                >
                  {organization.display_name || organization.name}
                </Link>
                {canManageOrg && showActions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:flex flex-wrap justify-center gap-4 text-sm">
                {!isLoading && (
                  <>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-medium">{membersCount}</span>
                      <span>member{membersCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Package className="h-3.5 w-3.5" />
                      <span className="font-medium">{packagesCount}</span>
                      <span>package{packagesCount !== 1 ? "s" : ""}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-6">
            <GithubAvatarWithFallback
              username={organization.github_handle}
              fallback={organization.name}
              className="flex-shrink-0 shadow-sm size-16 md:size-20 lg:size-24"
              fallbackClassName="font-bold text-xl md:text-2xl lg:text-3xl"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <Link
                  href={`/${organization.name}`}
                  className="font-bold text-gray-900 text-2xl md:text-3xl truncate"
                >
                  {organization.display_name || organization.name}
                </Link>
                {canManageOrg && showActions && (
                  <Button variant="outline" onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                {!isLoading && (
                  <>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-gray-900">
                        {membersCount}
                      </span>
                      <span>member{membersCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium text-gray-900">
                        {packagesCount}
                      </span>
                      <span>package{packagesCount !== 1 ? "s" : ""}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Organization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
