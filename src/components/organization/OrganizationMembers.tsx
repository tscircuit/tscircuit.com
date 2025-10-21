import React from "react"
import { Link } from "wouter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Loader2 } from "lucide-react"
import { timeAgo } from "@/lib/utils/timeAgo"
import { cn } from "@/lib/utils"
import { useListOrgMembers } from "@/hooks/use-list-org-members"
import { getMemberRole } from "@/lib/utils/member-role"
import { RoleBadge } from "@/components/ui/role-badge"
import { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

interface OrganizationMembersProps {
  organization: PublicOrgSchema
  className?: string
}

export const OrganizationMembers: React.FC<OrganizationMembersProps> = ({
  organization,
  className,
}) => {
  const { data: members = [], isLoading } = useListOrgMembers({
    orgId: organization.org_id,
  })

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-4 sm:p-6",
          className,
        )}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Members
          </h2>
        </div>
        <div className="text-center py-20 text-gray-500 grid place-items-center">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="mt-2 text-sm select-none">Loading members...</p>
        </div>
      </div>
    )
  }
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 sm:p-6",
        className,
      )}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Members ({members.length})
        </h2>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {members.map((member) => {
          const role = getMemberRole(organization, member.account_id)
          return (
            <Link
              key={member.account_id || member.github_username}
              href={`/${member.github_username}`}
              className="block"
            >
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage
                      src={`https://github.com/${member.github_username}.png`}
                      alt={`${member.github_username} avatar`}
                    />
                    <AvatarFallback className="text-sm font-medium">
                      {member.github_username
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {member.github_username}
                      </h3>
                      <RoleBadge role={role} />
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      @{member.github_username}
                    </p>
                  </div>
                </div>
                {member.joined_at && (
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-gray-500">
                      Joined {timeAgo(new Date(member.joined_at))}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm sm:text-base">No members found</p>
        </div>
      )}
    </div>
  )
}
