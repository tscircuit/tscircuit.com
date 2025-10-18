import { cn } from "@/lib/utils"
import {
  type MemberRole,
  getRoleIcon,
  getRoleColor,
  getRoleName,
} from "@/lib/utils/member-role"

interface RoleBadgeProps {
  role: MemberRole
  className?: string
}

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  return (
    <div
      className={cn(
        "select-none inline-flex items-center gap-1 py-0.5 px-1.5 rounded text-xs font-medium flex-shrink-0",
        getRoleColor(role),
        className,
      )}
    >
      {getRoleIcon(role)}
      <span className="leading-none">{getRoleName(role)}</span>
    </div>
  )
}
