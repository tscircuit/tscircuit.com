import React from "react"
import { Link } from "wouter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Crown, Shield, User, Loader2 } from "lucide-react"
import { timeAgo } from "@/lib/utils/timeAgo"
import { cn } from "@/lib/utils"
import { Account } from "fake-snippets-api/lib/db/schema"
import { useListOrgMembers } from "@/hooks/use-list-org-members"

interface OrganizationMembersProps {
  orgId: string
  className?: string
}
type MemberRole = "owner" | "admin" | "member" //todo
const getRoleIcon = (role: MemberRole) => {
  switch (role) {
    case "owner":
      return <Crown className="h-3 w-3" />
    case "admin":
      return <Shield className="h-3 w-3" />
    case "member":
      return <User className="h-3 w-3" />
    default:
      return <User className="h-3 w-3" />
  }
}

const getRoleColor = (role: MemberRole) => {
  switch (role) {
    case "owner":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "admin":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "member":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const OrganizationMembers: React.FC<OrganizationMembersProps> = ({
  orgId,
  className,
}) => {
  const { data: members = [], isLoading } = useListOrgMembers({ orgId })

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
        "bg-white rounded-lg border border-gray-200 p-4 py-20 sm:p-6",
        className,
      )}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          Members ({members.length})
        </h2>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {members.map((member) => (
          <Link
            key={member.account_id || member.github_username}
            href={`/${member.github_username}`}
            className="block"
          >
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  {member.github_username && (
                    <AvatarImage
                      src={`https://github.com/${member.github_username}.png`}
                      alt={`${member.github_username} avatar`}
                    />
                  )}
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
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs flex items-center gap-1 flex-shrink-0",
                        getRoleColor("admin"),
                      )}
                    >
                      {getRoleIcon("admin")}
                      {"admin"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    @{member.github_username}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-xs text-gray-500">
                  Joined {timeAgo(new Date())}
                </p>
              </div>
            </div>
          </Link>
        ))}
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
