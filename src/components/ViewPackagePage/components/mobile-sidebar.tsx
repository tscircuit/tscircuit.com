import { GitFork, Star, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface PackageInfo {
  name: string
  unscoped_name: string
  owner_github_username: string
  star_count: string
  latest_version?: string
  description: string
  ai_description: string
  creator_account_id?: string
  owner_org_id?: string
  is_package?: boolean
}

interface MobileSidebarProps {
  packageInfo?: PackageInfo
  isLoading?: boolean
  onViewChange: (view: "schematic" | "pcb" | "3d") => void
}

export default function MobileSidebar({
  packageInfo,
  isLoading = false,
  onViewChange,
}: MobileSidebarProps) {
  const topics = packageInfo?.is_package ? ["Package"] : ["Board"]

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] md:hidden">
        {/* Description skeleton */}
        <Skeleton className="h-4 w-full mb-4" />

        {/* Tags/Topics skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>

        <div className="flex justify-between text-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] md:hidden">
      {/* Description */}
      <p className="text-sm mb-4 text-gray-700 dark:text-[#c9d1d9]">
        {packageInfo?.description ||
          "A Default 60 keyboard created with tscircuit"}
      </p>

      {/* Tags/Topics */}
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

      <div className="flex justify-between text-sm">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span className="mr-4">
            {packageInfo ? (
              `${packageInfo.star_count} stars`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
        <div className="flex items-center">
          <GitFork className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span className="mr-4">
            {packageInfo ? (
              `${(packageInfo as any).fork_count ?? 0} forks`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span>
            {packageInfo ? (
              `v${packageInfo.latest_version || "-"}`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {["3D View", "PCB View", "Schematic View"].map((view, index) => (
          <PreviewButton
            onClick={() =>
              onViewChange(
                view.split(" ")[0].toLowerCase() as "schematic" | "pcb" | "3d",
              )
            }
            packageInfo={packageInfo}
            key={index}
            view={view}
          />
        ))}
      </div>
    </div>
  )
}

function PreviewButton({
  packageInfo,
  view,
  onClick,
}: {
  packageInfo?: PackageInfo
  view: string
  onClick: () => void
}) {
  let imageUrl: string | null = null
  if (packageInfo && view === "PCB View") {
    imageUrl = `https://registry-api.tscircuit.com/snippets/images/${packageInfo.name}/pcb.png`
  } else if (packageInfo && view === "Schematic View") {
    imageUrl = `https://registry-api.tscircuit.com/snippets/images/${packageInfo.name}/schematic.png`
  } else if (packageInfo && view === "3D View") {
    imageUrl = `https://registry-api.tscircuit.com/snippets/images/${packageInfo.name}/3d.png`
  }

  if (imageUrl) {
    return (
      <button
        onClick={onClick}
        className="aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors"
      >
        <img src={imageUrl} alt={view} className="w-full h-full object-cover" />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors"
    >
      <span className="text-xs font-medium text-gray-700 dark:text-[#c9d1d9]">
        {view}
      </span>
    </button>
  )
}
