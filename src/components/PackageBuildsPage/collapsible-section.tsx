import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { ChevronRight } from "lucide-react"
import type React from "react"
import type { ErrorObjectOrString } from "./ErrorObject"
import { capitalCase } from "./capitalCase"
import { getColorForDisplayStatus } from "./getColorForDisplayStatus"

interface CollapsibleSectionProps {
  title: string
  duration?: string
  error?: ErrorObjectOrString | null
  displayStatus?: PackageRelease["display_status"]
  isOpen: boolean
  onToggle: () => void
  children?: React.ReactNode
}

export function CollapsibleSection({
  title,
  duration,
  displayStatus,
  isOpen,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <ChevronRight
              className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
            />
            <span className="font-medium truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-6 sm:ml-0">
            {duration && (
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {duration}
              </span>
            )}
            <div
              className={`w-2 h-2 rounded-lg flex-shrink-0 ${getColorForDisplayStatus(displayStatus)}`}
            />
            <div className="text-gray-600 text-xs font-medium whitespace-nowrap">
              {capitalCase(displayStatus) || "???"}
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="bg-white border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
          <div className="p-4 overflow-x-auto max-w-full">{children}</div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
