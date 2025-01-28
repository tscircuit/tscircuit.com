import React from "react"
import { cn } from "@/lib/utils"

type BadgeType = "board" | "package" | "footprint" | "model"

interface TypeBadgeProps {
  type: string | BadgeType
  className?: string
}

const typeColors: Record<BadgeType, string> = {
  board: "bg-blue-500",
  package: "bg-green-500",
  footprint: "bg-purple-500",
  model: "bg-indigo-500",
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className }) => {
  if (!type) return null
  return (
    <span
      className={cn(
        "text-white px-2 py-1 rounded text-xs font-semibold",
        typeColors[type as BadgeType],
        className,
      )}
    >
      {type.toUpperCase()}
    </span>
  )
}
