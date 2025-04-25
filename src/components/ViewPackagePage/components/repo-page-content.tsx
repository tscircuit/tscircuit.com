"use client"

import { useState, useEffect, useMemo } from "react"
import MainContentHeader from "./main-content-header"
import Sidebar from "./sidebar"
import MobileSidebar from "./mobile-sidebar"
import ImportantFilesView from "./important-files-view"

// Tab Views
import FilesView from "./tab-views/files-view"
import ThreeDView from "./tab-views/3d-view"
import PCBView from "./tab-views/pcb-view"
import SchematicView from "./tab-views/schematic-view"
import BOMView from "./tab-views/bom-view"
import { isPackageFileImportant } from "../utils/is-package-file-important"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PackageHeader from "./package-header"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useLocation } from "wouter"
import { PackageInfo } from "@/lib/types"

interface PackageFile {
  package_file_id: string
  package_release_id: string
  file_path: string
  file_content: string
  content_text?: string // Keep for backward compatibility
  created_at: string // iso-8601
}


interface RepoPageContentProps {
  packageFiles?: PackageFile[]
  importantFilePaths?: string[]
  packageInfo?: PackageInfo
  onFileClicked?: (file: PackageFile) => void
  onEditClicked?: () => void
}

export default function RepoPageContent({
  packageFiles,
  packageInfo,
  onFileClicked,
  onEditClicked,
}: RepoPageContentProps) {
  const [location, setLocation] = useLocation()
  const [activeView, setActiveView] = useState<string>("files")
  const session = useGlobalStore((s) => s.session)

  // Handle hash-based view selection
  useEffect(() => {
    // Get the hash without the # character
    const hash = window.location.hash.slice(1)
    // Valid views
    const validViews = ["files", "3d", "pcb", "schematic", "bom"]

    // If hash is a valid view, set it as active
    if (validViews.includes(hash)) {
      setActiveView(hash)
    }
  }, [])

  const importantFilePaths = packageFiles
    ?.filter((pf) => isPackageFileImportant(pf.file_path))
    ?.map((pf) => pf.file_path)

  // We've moved the directory and file computation to the FilesView component

  // Find important files based on importantFilePaths
  const importantFiles = useMemo(() => {
    if (!packageFiles || !importantFilePaths) return []

    return packageFiles.filter((file) =>
      importantFilePaths.some((path) => file.file_path.endsWith(path)),
    )
  }, [packageFiles, importantFilePaths])

  // Generate package name with version for file lookups
  const packageNameWithVersion = useMemo(() => {
    if (!packageInfo) return ""

    // Format: @scope/packageName@version or packageName@version
    const name = packageInfo.name

    // Extract the latest version from the files (assuming version information is available)
    const versionFile = packageFiles?.find(
      (file) => file.file_path === "package.json",
    )
    let version = "latest"

    if (versionFile) {
      try {
        const content =
          versionFile.file_content || versionFile.content_text || "{}"
        const packageJson = JSON.parse(content)
        if (packageJson.version) {
          version = packageJson.version
        }
      } catch (e) {
        // If package.json can't be parsed, use "latest"
      }
    }

    return `${name}@${version}`
  }, [packageInfo, packageFiles])
  // Render the appropriate content based on the active view
  const renderContent = () => {
    switch (activeView) {
      case "files":
        return (
          <FilesView
            packageFiles={packageFiles}
            isLoading={!packageFiles}
            onFileClicked={onFileClicked}
          />
        )
      case "3d":
        return <ThreeDView />
      case "pcb":
        return <PCBView />
      case "schematic":
        return <SchematicView />
      case "bom":
        return <BOMView />
      default:
        return (
          <FilesView
            packageFiles={packageFiles}
            isLoading={!packageFiles}
            onFileClicked={onFileClicked}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-sans">
      <Header />
      <PackageHeader
        packageInfo={packageInfo}
        isCurrentUserAuthor={
          packageInfo?.creator_account_id === session?.github_username
        }
      />

      {/* Mobile Sidebar */}
      <div className="max-w-[1200px] mx-auto">
        <MobileSidebar
          onViewChange={(view) => {
            setActiveView(view)
            // Update URL hash when view changes
            window.location.hash = view
          }}
          isLoading={!packageInfo}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Main Content Area */}
          <div className="w-full md:flex-1 border-r border-gray-200 dark:border-[#30363d] p-4 md:max-w-[calc(100%-296px)] max-w-full">
            {/* Main Content Header with Tabs */}
            <MainContentHeader
              activeView={activeView}
              onViewChange={(view) => {
                setActiveView(view)
                // Update URL hash when view changes
                window.location.hash = view
              }}
              packageInfo={packageInfo}
            />

            {/* Dynamic Content based on active view */}
            {renderContent()}

            {/* Important Files View - Always shown */}
            <ImportantFilesView
              importantFiles={importantFiles}
              isLoading={!packageFiles}
              onEditClicked={onEditClicked}
              aiDescription={packageInfo?.ai_description}
              aiUsageInstructions={packageInfo?.ai_usage_instructions}
            />
          </div>

          {/* Sidebar - Hidden on mobile, shown on md and up */}
          <div className="hidden md:block md:w-[296px] flex-shrink-0">
            <Sidebar
              packageInfo={packageInfo}
              isLoading={!packageInfo}
              onViewChange={(view) => {
                setActiveView(view)
                // Update URL hash when view changes
                window.location.hash = view
              }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
