import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, Users, Package, Lock, Globe2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

interface OrganizationHeaderProps {
  organization: PublicOrgSchema
  isCurrentUserOrganization?: boolean
  className?: string
}

export const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({
  organization,
  className,
}) => {
  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center items-start gap-4 md:gap-6">
          {/* Organization Avatar */}
          <div className="flex-shrink-0 self-center md:self-start">
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
          </div>

          {/* Organization Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Name */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-2 text-center md:text-left">
                  <h1 className="font-bold text-gray-900 text-xl md:text-2xl lg:text-3xl truncate">
                    {organization.name}
                  </h1>
                </div>

                {/* Statistics */}
                <div className="flex flex-col md:flex-row md:flex-wrap items-center text-gray-600 gap-3 md:gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">2</span>
                    <span>members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">2</span>
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
    </div>
  )
}
