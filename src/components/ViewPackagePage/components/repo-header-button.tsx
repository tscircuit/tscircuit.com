import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

interface RepoHeaderButtonProps {
  icon: ReactNode
  label: string
  count?: number
}

export default function RepoHeaderButton({
  icon,
  label,
  count,
}: RepoHeaderButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="border-gray-300 dark:border-[#30363d] bg-gray-100 hover:bg-gray-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-gray-700 dark:text-[#c9d1d9]"
    >
      {icon}
      {label}
      {count !== undefined && (
        <Badge
          variant="outline"
          className="ml-2 text-xs rounded-full px-2 py-0.5 bg-transparent border-gray-300 dark:border-[#30363d]"
        >
          {count}
        </Badge>
      )}
      <ChevronDown className="h-4 w-4 ml-1" />
    </Button>
  )
}
