import React, { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Building2, Users, Package, Lock, Globe2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useLocation } from "wouter"
import { useOrganization } from "@/hooks/use-organization"

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
            <Avatar className="border-4 border-gray-100 shadow-sm size-16 md:size-20 lg:size-24">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xl md:text-2xl lg:text-3xl">
                {(organization.name || "")
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex flex-col items-center gap-3 mb-3">
                <h1 className="font-bold text-gray-900 text-xl">
                  {organization.name}
                </h1>
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
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {isLoading ? "..." : membersCount}
                  </span>
                  <span>members</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Package className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {isLoading ? "..." : packagesCount}
                  </span>
                  <span>packages</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-6">
            <Avatar className="border-4 border-gray-100 shadow-sm size-16 md:size-20 lg:size-24 flex-shrink-0">
              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xl md:text-2xl lg:text-3xl">
                {(organization.name || "")
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-bold text-gray-900 text-2xl md:text-3xl truncate">
                  {organization.name}
                </h1>
                {canManageOrg && showActions && (
                  <Button variant="outline" onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-gray-900">
                    {isLoading ? "..." : membersCount}
                  </span>
                  <span>members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium text-gray-900">
                    {isLoading ? "..." : packagesCount}
                  </span>
                  <span>packages</span>
                </div>
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
