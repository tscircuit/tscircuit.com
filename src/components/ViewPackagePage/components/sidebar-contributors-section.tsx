import { Badge } from "@/components/ui/badge"

export default function SidebarContributorsSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Contributors</h2>
        <Badge
          variant="outline"
          className="text-xs rounded-full px-2 py-0.5 bg-transparent border-gray-300 dark:border-[#30363d]"
        >
          18
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"
          ></div>
        ))}
      </div>
      <a
        href="#"
        className="text-blue-600 dark:text-[#58a6ff] hover:underline text-sm"
      >
        + 4 contributors
      </a>
    </div>
  )
}
