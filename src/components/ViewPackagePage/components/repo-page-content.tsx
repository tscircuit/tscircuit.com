"use client"

import { useState, useEffect, useMemo } from "react"
import MainContentHeader from "./main-content-header"
import Sidebar from "./sidebar"
import MobileSidebar from "./mobile-sidebar"
import ImportantFilesView from "./important-files-view"
import { ShikiCodeViewer } from "./ShikiCodeViewer"

// Tab Views
import FilesView from "./tab-views/files-view"
import ThreeDView from "./tab-views/3d-view"
import PCBView from "./tab-views/pcb-view"
import SchematicView from "./tab-views/schematic-view"
import BOMView from "./tab-views/bom-view"
import { isPackageFileImportant } from "../utils/is-package-file-important"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ViewSnippetHeader from "@/components/ViewSnippetHeader"
import PackageHeader from "./package-header"

interface PackageFile {
  package_file_id: string
  package_release_id: string
  file_path: string
  content_text: string
  created_at: string // iso-8601
}

interface PackageInfo {
  name: string
  unscoped_name: string
  owner_github_username: string
  star_count: string
  description: string
  ai_description: string
  ai_usage_instructions: string
  creator_account_id?: string
  owner_org_id?: string
}

interface RepoPageContentProps {
  packageFiles?: PackageFile[]
  importantFilePaths?: string[]
  packageInfo?: PackageInfo
  onFileClicked?: (file: any) => void
  onDirectoryClicked?: (directory: any) => void
  onExportClicked?: (exportType: string) => void
  onEditClicked?: () => void
}

export default function RepoPageContent({
  packageFiles,
  packageInfo,
  onFileClicked,
  onDirectoryClicked,
  onExportClicked,
  onEditClicked,
}: RepoPageContentProps) {
  const [activeTab, setActiveTab] = useState("code")
  const [activeView, setActiveView] = useState("files")

  const importantFilePaths = packageFiles
    ?.filter((pf) => isPackageFileImportant(pf.file_path))
    ?.map((pf) => pf.file_path)

  // Parse package files to determine directories and files structure
  const { directories, files } = useMemo(() => {
    if (!packageFiles) {
      return { directories: [], files: [] }
    }

    const dirs = new Set<string>()
    const filesList: Array<{
      type: "file"
      path: string
      name: string
      created_at: string
    }> = []

    packageFiles.forEach((file) => {
      // Extract directory path
      const pathParts = file.file_path.split("/")
      const fileName = pathParts.pop() || ""

      // Add all parent directories
      let currentPath = ""
      pathParts.forEach((part) => {
        currentPath += (currentPath ? "/" : "") + part
        dirs.add(currentPath)
      })

      filesList.push({
        type: "file",
        path: file.file_path,
        name: fileName,
        created_at: file.created_at,
      })
    })

    // Convert directories set to array of directory objects
    const dirsList = Array.from(dirs)
      .map((path) => {
        const pathParts = path.split("/")
        if (!path) return null
        return {
          type: "directory",
          path,
          name: pathParts[pathParts.length - 1],
        }
      })
      .filter((dir) => dir !== null)

    return {
      directories: dirsList,
      files: filesList,
    }
  }, [packageFiles])

  // Find important files based on importantFilePaths
  const importantFiles = useMemo(() => {
    if (!packageFiles || !importantFilePaths) return []

    return packageFiles.filter((file) =>
      importantFilePaths.some((path) => file.file_path.endsWith(path)),
    )
  }, [packageFiles, importantFilePaths])

  // Render the appropriate content based on the active view
  const renderContent = () => {
    switch (activeView) {
      case "files":
        return (
          <FilesView
            directories={directories}
            files={files}
            isLoading={!packageFiles}
            onFileClicked={onFileClicked}
            onDirectoryClicked={onDirectoryClicked}
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
            directories={directories}
            files={files}
            isLoading={!packageFiles}
            onFileClicked={onFileClicked}
            onDirectoryClicked={onDirectoryClicked}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-sans">
      <Header />
      <PackageHeader packageInfo={packageInfo} />

      {/* Mobile Sidebar */}
      <div className="max-w-[1200px] mx-auto">
        <MobileSidebar packageInfo={packageInfo} isLoading={!packageInfo} />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Main Content Area */}
          <div className="w-full md:flex-1 border-r border-gray-200 dark:border-[#30363d] p-4 md:max-w-[calc(100%-296px)] max-w-full">
            {/* Main Content Header with Tabs */}
            <MainContentHeader
              activeView={activeView}
              onViewChange={setActiveView}
              onExportClicked={onExportClicked}
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
            <Sidebar packageInfo={packageInfo} isLoading={!packageInfo} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
