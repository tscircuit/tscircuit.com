import { cn } from "@/lib/utils"
import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react"

type InvitationStatus = "pending" | "accepted" | "revoked" | "expired"

interface InvitationStatusBadgeProps {
  status: InvitationStatus
  className?: string
}

const getStatusColor = (status: InvitationStatus): string => {
  switch (status) {
    case "pending":
      return "bg-blue-50 text-blue-700 border border-blue-200"
    case "accepted":
      return "bg-green-50 text-green-700 border border-green-200"
    case "revoked":
      return "bg-gray-100 text-gray-600 border border-gray-200"
    case "expired":
      return "bg-red-50 text-red-700 border border-red-200"
  }
}

const getStatusIcon = (status: InvitationStatus) => {
  const iconClass = "h-3 w-3"
  switch (status) {
    case "pending":
      return <Clock className={iconClass} />
    case "accepted":
      return <CheckCircle2 className={iconClass} />
    case "revoked":
      return <Ban className={iconClass} />
    case "expired":
      return <XCircle className={iconClass} />
  }
}

const getStatusLabel = (status: InvitationStatus): string => {
  switch (status) {
    case "pending":
      return "Pending"
    case "accepted":
      return "Accepted"
    case "revoked":
      return "Revoked"
    case "expired":
      return "Expired"
  }
}

export const InvitationStatusBadge = ({
  status,
  className,
}: InvitationStatusBadgeProps) => {
  return (
    <div
      className={cn(
        "select-none inline-flex items-center gap-1 py-0.5 px-1.5 rounded text-xs font-medium flex-shrink-0",
        getStatusColor(status),
        className,
      )}
    >
      {getStatusIcon(status)}
      <span className="leading-none">{getStatusLabel(status)}</span>
    </div>
  )
}
