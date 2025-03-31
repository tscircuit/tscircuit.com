import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Box, CircuitBoard, Layers, Rotate3D } from "lucide-react"
import type React from "react"

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

const typeLabels: Record<SnippetType, string> = {
  board: "Board",
  package: "Package",
  footprint: "Footprint",
  model: "Model",
}

export const SnippetTypeIcon: React.FC<SnippetTypeIconProps> = ({
  type,
  className,
}) => {
  if (!type || !(type in typeIcons)) return null
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn("flex items-center", typeColors[type], className)}
          >
            {typeIcons[type]}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{typeLabels[type]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
