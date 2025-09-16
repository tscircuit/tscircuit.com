import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Building2, Users, Package, Lock, Globe2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { useGlobalStore } from "@/hooks/use-global-store"

interface OrganizationHeaderProps {
  organization: PublicOrgSchema
  isCurrentUserOrganization?: boolean
  className?: string
}

export const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({
  organization,
  className,
}) => {
  const session = useGlobalStore((s) => s.session)
  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="container mx-auto px-6 py-6">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="border-4 border-gray-100 shadow-sm size-16 md:size-20 lg:size-24">
              <AvatarImage
                src={`https://github.com/${organization.name}.png`}
                alt={`${organization.name} avatar`}
                className="object-cover"
              />
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
              {organization.owner_account_id === session?.account_id && (
                <div className="flex flex-col items-center gap-3 mb-3">
                  <h1 className="font-bold text-gray-900 text-xl">
                    {organization.name}
                  </h1>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 md:flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">2</span>
                  <span>members</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Package className="h-3.5 w-3.5" />
                  <span className="font-medium">2</span>
                  <span>packages</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Organization</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  {organization.is_personal_org ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Globe2 className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {organization.is_personal_org ? "Personal" : "Public"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-6">
            <Avatar className="border-4 border-gray-100 shadow-sm size-16 md:size-20 lg:size-24 flex-shrink-0">
              <AvatarImage
                src={`https://github.com/${organization.name}.png`}
                alt={`${organization.name} avatar`}
                className="object-cover"
              />
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
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-gray-900">2</span>
                  <span>members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium text-gray-900">2</span>
                  <span>packages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Organization</span>
                </div>
                <div className="flex items-center gap-2">
                  {organization.is_personal_org ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Globe2 className="h-4 w-4" />
                  )}
                  <span>
                    {organization.is_personal_org ? "Personal" : "Public"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
