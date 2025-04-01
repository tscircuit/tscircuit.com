"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, CodeIcon, Download, Copy, Check, Hammer } from "lucide-react"
import MainContentViewSelector from "./main-content-view-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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

interface MainContentHeaderProps {
  activeView: string
  onViewChange: (view: string) => void
  onExportClicked?: (exportType: string) => void
  packageInfo?: PackageInfo
}

export default function MainContentHeader({
  activeView,
  onViewChange,
  onExportClicked,
  packageInfo,
}: MainContentHeaderProps) {
  const [copyInstallState, setCopyInstallState] = useState<"copy" | "copied">("copy")
  const [copyCloneState, setCopyCloneState] = useState<"copy" | "copied">("copy")

  const handleCopyInstall = () => {
    const command = `tsci add ${packageInfo?.name || "@tscircuit/keyboard-default60"}`
    navigator.clipboard.writeText(command)
    setCopyInstallState("copied")
    setTimeout(() => setCopyInstallState("copy"), 2000)
  }

  const handleCopyClone = () => {
    const command = `tsci clone ${packageInfo?.name || "@tscircuit/keyboard-default60"}`
    navigator.clipboard.writeText(command)
    setCopyCloneState("copied")
    setTimeout(() => setCopyCloneState("copy"), 2000)
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <MainContentViewSelector activeView={activeView} onViewChange={onViewChange} />

      <div className="flex space-x-2">
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-gray-300 dark:border-[#30363d] bg-gray-100 hover:bg-gray-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-gray-700 dark:text-[#c9d1d9]"
            >
              <Download className="h-4 w-4 mr-0.5" />
              Export
              <ChevronDown className="h-4 w-4 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onExportClicked && onExportClicked("circuit_json")}
            >
              <Download className="h-4 w-4 mr-1.5 text-gray-500 dark:text-[#8b949e]" />
              Circuit JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onExportClicked && onExportClicked("fabrication_files")}
            >
              <Hammer className="h-4 w-4 mr-1.5 text-gray-500 dark:text-[#8b949e]" />
              Fabrication Files
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Code Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="h-9 bg-green-600 hover:bg-green-700 dark:bg-[#238636] dark:hover:bg-[#2ea043] text-white"
            >
              <CodeIcon className="h-4 w-4 mr-0.5" />
              Code
              <ChevronDown className="h-4 w-4 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuItem className="cursor-pointer">Edit Online</DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Install Option */}
            <div className="p-2">
              <div className="text-sm font-medium mb-1">Install</div>
              <div className="flex items-center bg-gray-100 dark:bg-[#161b22] rounded-md p-2 text-sm font-mono">
                <code className="flex-1 overflow-x-auto">
                  tsci add {packageInfo?.name || "@tscircuit/keyboard-default60"}
                </code>
                <button
                  className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-[#30363d] rounded"
                  onClick={handleCopyInstall}
                >
                  {copyInstallState === "copy" ? (
                    <Copy className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Clone Option */}
            <div className="p-2">
              <div className="text-sm font-medium mb-1">Clone</div>
              <div className="flex items-center bg-gray-100 dark:bg-[#161b22] rounded-md p-2 text-sm font-mono">
                <code className="flex-1 overflow-x-auto">
                  tsci clone {packageInfo?.name || "@tscircuit/keyboard-default60"}
                </code>
                <button
                  className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-[#30363d] rounded"
                  onClick={handleCopyClone}
                >
                  {copyCloneState === "copy" ? (
                    <Copy className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

