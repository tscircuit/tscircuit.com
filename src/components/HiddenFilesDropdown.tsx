"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Check } from "lucide-react"

interface HiddenFilesDropdownProps {
  showHiddenFiles: boolean
  onToggleHiddenFiles: () => void
}

export default function HiddenFilesDropdown({
  showHiddenFiles,
  onToggleHiddenFiles,
}: HiddenFilesDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-md shadow-lg"
      >
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={onToggleHiddenFiles}
          className="text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#21262d] flex items-center gap-2"
        >
          <Check
            className={`h-4 w-4 transition-opacity ${showHiddenFiles ? "opacity-100" : "opacity-0"}`}
          />
          Show Hidden Files
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
