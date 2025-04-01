import { Clock, FileText, Folder, Tag } from "lucide-react"

export default function FileExplorer() {
  const files = [
    {
      type: "folder",
      name: "lib",
      message: "Utilities for parsing keyboard layouts",
      time: "last week",
    },
    {
      type: "folder",
      name: "tests",
      message: "Example keyboard configurations",
      time: "2 days ago",
    },
    {
      type: "file",
      name: "LICENSE",
      message: "MIT License",
      time: "2 months ago",
    },
    {
      type: "file",
      name: "README.md",
      message: "Overview of project",
      time: "last month",
    },
    {
      type: "file",
      name: "biome.json",
      message: "Formatting configuration",
      time: "2 months ago",
    },
    {
      type: "file",
      name: "bun.lock",
      message: "",
      time: "2 days ago",
    },
    {
      type: "file",
      name: "package.json",
      message: "Package dependencies",
      time: "2 days ago",
    },
    {
      type: "file",
      name: "tsconfig.json",
      message: "TypeScript configuration",
      time: "2 months ago",
    },
  ]

  return (
    <div className="border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden">
      <div className="flex items-center px-4 py-2 md:py-3 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]">
        {/* Desktop view */}
        <div className="hidden md:flex items-center text-xs">
          <Tag className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span className="text-gray-500 dark:text-[#8b949e]">v0.0.361</span>
          <div className="ml-2 text-green-500 dark:text-[#3fb950]">✓</div>
        </div>
        <div className="hidden md:flex ml-auto items-center text-xs text-gray-500 dark:text-[#8b949e]">
          <Clock className="h-4 w-4 mr-1" />
          <span>2 days ago</span>
          <div className="ml-4 flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            <span>12 Releases</span>
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden flex items-center justify-between w-full">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-[#8b949e]">
              v0.0.361
            </span>
            <div className="ml-1 text-green-500 dark:text-[#3fb950]">✓</div>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-[#8b949e]">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-0.5" />
              <span>2d</span>
            </div>
            <div className="flex items-center">
              <Tag className="h-3 w-3 mr-0.5" />
              <span>12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Files */}
      <div className="bg-white dark:bg-[#0d1117]">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]"
          >
            {file.type === "folder" ? (
              <Folder className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
            ) : (
              <FileText className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
            )}
            <span className="text-sm">{file.name}</span>
            <span className="ml-auto text-xs text-gray-500 dark:text-[#8b949e]">
              {file.message}
            </span>
            <span className="ml-4 text-xs text-gray-500 dark:text-[#8b949e]">
              {file.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
