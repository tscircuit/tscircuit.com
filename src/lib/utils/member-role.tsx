import { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { Crown, Shield, User } from "lucide-react"

export type MemberRole = "owner" | "manager" | "member"

export const getRoleName = (role: MemberRole) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export const getMemberRole = (
  organization: PublicOrgSchema,
  accountId: string,
): MemberRole => {
  const isOwner =
    String(accountId).trim() === String(organization.owner_account_id).trim()
  const isManager = Object.values(organization.user_permissions ?? {}).some(
    Boolean,
  )
  if (isOwner) {
    return "owner"
  }
  if (isManager) {
    return "manager"
  }
  return "member"
}

export const getRoleIcon = (role: MemberRole) => {
  switch (role) {
    case "owner":
      return <Crown className="size-3" />
    case "manager":
      return <Shield className="size-3" />
    case "member":
      return <User className="size-3" />
    default:
      return <User className="size-3" />
  }
}

export const getRoleColor = (role: MemberRole) => {
  switch (role) {
    case "owner":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "manager":
      return "bg-blue-50 text-blue-700 border border-blue-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const getRoleDescription = (role: MemberRole) => {
  switch (role) {
    case "owner":
      return "Full access to organization settings"
    case "manager":
      return "Limited administrative privileges"
    case "member":
      return "Standard member access"
  }
}
