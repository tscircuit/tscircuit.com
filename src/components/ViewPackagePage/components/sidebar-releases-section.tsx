import { Tag, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SidebarReleasesSectionProps {
  isLoading?: boolean
}

export default function SidebarReleasesSection({ isLoading = false }: SidebarReleasesSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Releases</h2>
        <div className="mb-2">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mb-3">
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Releases</h2>
      <div className="flex items-center mb-2">
        <Tag className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
        <span className="text-sm font-medium">v0.0.361</span>
      </div>
      <div className="flex items-center mb-3">
        <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
        <span className="text-sm text-gray-500 dark:text-[#8b949e]">2 days ago</span>
      </div>
      <a href="#" className="text-blue-600 dark:text-[#58a6ff] hover:underline text-sm">
        Create a new release
      </a>
    </div>
  )
}

