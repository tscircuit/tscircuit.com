import { Badge } from "@/components/ui/badge"
import { GitFork, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PackageInfo {
  name: string
  unscoped_name: string
  owner_github_username: string
  star_count: string
  description: string
  ai_description: string
  creator_account_id?: string
  owner_org_id?: string
}

interface SidebarAboutSectionProps {
  packageInfo?: PackageInfo
  isLoading?: boolean
}

export default function SidebarAboutSection({
  packageInfo,
  isLoading = false,
}: SidebarAboutSectionProps) {
  const topics = ["Keyboard", "PCB-Layout", "Manufacturable"]

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">About</h2>
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">About</h2>
      <p className="text-sm mb-3">
        {packageInfo?.description || packageInfo?.ai_description}
      </p>
      <a
        href="#"
        className="text-blue-600 dark:text-[#58a6ff] hover:underline text-sm flex items-center mb-4"
      >
        <svg className="h-4 w-4 mr-1" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0Z"></path>
        </svg>
        tscircuit.com
      </a>
      <div className="flex flex-wrap gap-2 mb-4">
        {topics.map((topic, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-xs rounded-full px-2 py-0.5 bg-blue-100 dark:bg-[#1f6feb33] text-blue-600 dark:text-[#58a6ff] border-blue-300 dark:border-[#1f6feb66]"
          >
            {topic}
          </Badge>
        ))}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <svg
            className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.53.53-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.29.736c-.264.152-.563.231-.868.231h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.53.53-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.29-.736c.263-.15.561-.231.865-.231H7.25V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z"></path>
          </svg>
          <span>MIT license</span>
        </div>
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
          <span>{packageInfo?.star_count || "16"} stars</span>
        </div>
        <div className="flex items-center">
          <GitFork className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
          <span>39 forks</span>
        </div>
      </div>
    </div>
  )
}
