import type React from "react"
import { ChevronRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CollapsibleSectionProps {
  title: string
  duration?: string
  isOpen: boolean
  onToggle: () => void
  badges?: Array<{
    text: string
    icon?: React.ReactNode
    variant?: "default" | "secondary"
    className?: string
  }>
  children?: React.ReactNode
}

export function CollapsibleSection({
  title,
  duration,
  isOpen,
  onToggle,
  badges = [],
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <ChevronRight
              className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
            />
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant || "secondary"}
                className={
                  badge.className ||
                  "bg-gray-200 text-gray-700 flex items-center gap-1"
                }
              >
                {badge.icon}
                {badge.text}
              </Badge>
            ))}
            {duration && (
              <span className="text-sm text-gray-600">{duration}</span>
            )}
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 bg-white border-x border-b border-gray-200 rounded-b-lg">
          {children || `${title} details would go here...`}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
