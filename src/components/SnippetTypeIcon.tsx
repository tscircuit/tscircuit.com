import { Box, CircuitBoard, Layers, Rotate3D } from "lucide-react"
import React from "react"
import { cn } from "@/lib/utils"

type SnippetType = "board" | "package" | "footprint" | "model"

interface SnippetTypeIconProps {
  type: SnippetType
  className?: string
}

const typeIcons: Record<SnippetType, React.ReactNode> = {
  board: <CircuitBoard className="w-4 h-4" />,
  package: <Box className="w-4 h-4" />,
  footprint: <Layers className="w-4 h-4" />,
  model: <Rotate3D className="w-4 h-4" />,
}

const typeColors: Record<SnippetType, string> = {
  board: "text-blue-500",
  package: "text-green-500",
  footprint: "text-purple-500",
  model: "text-indigo-500",
}

export const SnippetTypeIcon: React.FC<SnippetTypeIconProps> = ({
  type,
  className,
}) => {
  if (!type || !(type in typeIcons)) return null
  return (
    <span className={cn("flex items-center", typeColors[type], className)}>
      {typeIcons[type]}
    </span>
  )
}
