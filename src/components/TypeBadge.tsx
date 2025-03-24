import React from "react"
import { cn } from "@/lib/utils"

type BadgeType = "board" | "package" | "footprint" | "model"

interface TypeBadgeProps {
  type: string | BadgeType
  className?: string
}

const typeColors: Record<BadgeType, string> = {
  board: "bg-blue-500/10 text-blue-600",
  package: "bg-green-500/10 text-green-600",
  footprint: "bg-purple-500/10 text-purple-600",
  model: "bg-indigo-500/10 text-indigo-600",
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className }) => {
  if (!type) return null
  return (
    <span
      className={cn(
        "inline-flex items-center rounded",
        typeColors[type as BadgeType],
        className,
      )}
    >
      {type.toUpperCase()}
    </span>
  )
}
