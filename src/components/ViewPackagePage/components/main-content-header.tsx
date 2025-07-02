"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  CodeIcon,
  Download,
  Copy,
  Check,
  Hammer,
  Pencil,
  GitForkIcon,
  DownloadIcon,
  Package2,
} from "lucide-react"
import MainContentViewSelector from "./main-content-view-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { DownloadButtonAndMenu } from "@/components/DownloadButtonAndMenu"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"
import { useLocation } from "wouter"
import { Package, PackageFile } from "fake-snippets-api/lib/db/schema"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useDownloadZip } from "@/hooks/use-download-zip"
interface MainContentHeaderProps {
  packageFiles: PackageFile[]
  activeView: string
  onViewChange: (view: string) => void
  onExportClicked?: (exportType: string) => void
  packageInfo?: Package
}

export default function MainContentHeader({
  packageFiles,
  activeView,
  onViewChange,
  packageInfo,
}: MainContentHeaderProps) {
  const [, setLocation] = useLocation()
  const [copyInstallState, setCopyInstallState] = useState<"copy" | "copied">(
    "copy",
  )
  const [copyCloneState, setCopyCloneState] = useState<"copy" | "copied">(
    "copy",
  )

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

  const { downloadZip } = useDownloadZip()

  const handleDownloadZip = () => {
    if (packageInfo && packageFiles) {
      downloadZip(packageInfo, packageFiles)
    }
  }

  const { circuitJson } = useCurrentPackageCircuitJson()

  return (
    <div className="flex items-center justify-between mb-4">
      <MainContentViewSelector
        activeView={activeView}
        onViewChange={onViewChange}
      />

      <div className="flex space-x-2">
        <DownloadButtonAndMenu
          unscopedName={packageInfo?.unscoped_name}
          desiredImageType={activeView}
          author={packageInfo?.owner_github_username ?? undefined}
          circuitJson={circuitJson}
        />

        {/* Code Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 dark:bg-[#238636] dark:hover:bg-[#2ea043] text-white"
            >
              <CodeIcon className="h-4 w-4 mr-1.5" />
              Code
              <ChevronDown className="h-4 w-4 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuItem disabled={!Boolean(packageInfo)} asChild>
              <a
                href={`/editor?package_id=${packageInfo?.package_id}`}
                className="cursor-pointer p-2 py-4"
              >
                <Pencil className="h-4 w-4 mx-3" />
                Edit Online
              </a>
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!Boolean(packageInfo)}
              onClick={handleDownloadZip}
              className="cursor-pointer p-2 py-4"
            >
              <Package2 className="h-4 w-4 mx-3" />
              Download ZIP
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Install Option */}
            <div className="p-2">
              <div className="text-sm font-medium mb-4 flex items-center">
                <DownloadIcon className="h-4 w-4 inline-block mr-1.5" />
                Install
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-[#161b22] rounded-md p-2 text-xs font-mono">
                <code className="flex-1 overflow-x-auto">
                  tsci add{" "}
                  {packageInfo?.name || "@tscircuit/keyboard-default60"}
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
              <div className="text-sm font-medium mb-4 flex items-center">
                <GitForkIcon className="h-4 w-4 inline-block mr-1.5" />
                Clone
              </div>
              <div className="flex items-center bg-gray-100 dark:bg-[#161b22] rounded-md p-2 text-xs font-mono">
                <code className="flex-1 overflow-x-auto">
                  tsci clone{" "}
                  {packageInfo?.name || "@tscircuit/keyboard-default60"}
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
