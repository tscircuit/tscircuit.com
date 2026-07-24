import { useState, useEffect, useMemo, useCallback } from "react"
import MainContentHeader from "./main-content-header"
import Sidebar from "./sidebar"
import MobileSidebar from "./mobile-sidebar"
import ImportantFilesView from "./important-files-view"
import { useHotkeyCombo } from "@/hooks/use-hotkey"

// Tab Views
import FilesView from "./tab-views/files-view"
import ThreeDView from "./tab-views/3d-view"
import PCBView from "./tab-views/pcb-view"
import SchematicView from "./tab-views/schematic-view"
import BOMView from "./tab-views/bom-view"
import PackageFileView from "./tab-views/package-file-view"
import {
  isPackageFileImportant,
  scorePackageFileImportance,
} from "../utils/is-package-file-important"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PackageHeader from "./package-header"
import { useGlobalStore } from "@/hooks/use-global-store"
import type {
  Package,
  PackageFile as ApiPackageFile,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { useUpdateAiDescriptionMutation } from "@/hooks/use-update-ai-description-mutation"
import SidebarReleasesSection from "./sidebar-releases-section"

interface PackageFile extends ApiPackageFile {
  file_content?: string
  content_text?: string | null
}

interface RepoPageContentProps {
  packageFiles?: PackageFile[]
  importantFilePaths?: string[]
  packageInfo?: Package
  packageRelease?: PublicPackageRelease
  onFileClicked?: (file: PackageFile) => void
  onEditClicked?: (filePath?: string | null) => void
  arePackageFilesFetched?: boolean
  packageFilesError?: Error | null
  currentVersion?: string | null
  latestVersion?: string
  onVersionChange?: (version: string, releaseId: string) => void
  fileBrowserMode?: "directory" | "file"
  fileBrowserPath?: string
  onDirectoryClicked?: (directoryPath: string) => void
  onFileBrowserViewChange?: (view: string) => void
}

const normalizeView = (view: string | null | undefined): string | null => {
  if (!view) return null
  const normalized = view.toLowerCase().trim()

  if (normalized === "3d view" || normalized === "3-d" || normalized === "3_d")
    return "3d"
  if (normalized === "pcb view") return "pcb"
  if (normalized === "schematic view") return "schematic"
  if (normalized === "bill of materials") return "bom"

  if (["files", "3d", "pcb", "schematic", "bom"].includes(normalized)) {
    return normalized
  }

  return null
}

export default function RepoPageContent({
  packageFiles,
  arePackageFilesFetched = false,
  packageFilesError = null,
  packageInfo,
  packageRelease,
  onFileClicked,
  onEditClicked,
  currentVersion,
  latestVersion,
  onVersionChange,
  fileBrowserMode,
  fileBrowserPath = "",
  onDirectoryClicked,
  onFileBrowserViewChange,
}: RepoPageContentProps) {
  const [activeView, setActiveView] = useState<string>("files")
  const [licenseFileRequested, setLicenseFileRequested] =
    useState<boolean>(false)
  const session = useGlobalStore((s) => s.session)

  useHotkeyCombo(
    "ctrl+Enter",
    useCallback(() => onEditClicked?.(), [onEditClicked]),
  )

  const { circuitJsonFound, isLoading: isCircuitJsonLoading } =
    useCurrentPackageCircuitJson()
  const circuitJsonExists = circuitJsonFound && !isCircuitJsonLoading

  const { mutate: updateAiDescription } = useUpdateAiDescriptionMutation()

  const handleLicenseFileRequest = () => {
    setLicenseFileRequested(true)
    setTimeout(() => setLicenseFileRequested(false), 100)
  }

  // Handle initial view selection and hash-based view changes
  useEffect(() => {
    if (!packageInfo || !arePackageFilesFetched) return

    if (fileBrowserMode) {
      setActiveView("files")
      return
    }

    const hashView = normalizeView(window.location.hash.slice(1))
    const defaultView = normalizeView(packageInfo?.default_view)

    const circuitDependentViews = new Set(["3d", "pcb", "schematic", "bom"])
    const validViews = ["files", "3d", "pcb", "schematic", "bom"]
    const availableViews = circuitJsonExists
      ? validViews
      : validViews.filter((view) => !circuitDependentViews.has(view))

    const availableViewSet = new Set(availableViews)

    if (hashView && availableViewSet.has(hashView)) {
      setActiveView(hashView)
    } else if (
      hashView &&
      circuitDependentViews.has(hashView) &&
      isCircuitJsonLoading
    ) {
      // Preserve explicit circuit-dependent links like #schematic until the
      // preview circuit JSON query finishes and we can verify availability.
      setActiveView(hashView)
      return
    } else if (defaultView && availableViewSet.has(defaultView)) {
      setActiveView(defaultView)
      window.location.hash = defaultView
    } else if (
      !hashView &&
      defaultView &&
      circuitDependentViews.has(defaultView) &&
      isCircuitJsonLoading
    ) {
      return
    } else {
      setActiveView("files")
      if (!hashView || !availableViewSet.has(hashView)) {
        window.location.hash = "files"
      }
    }
  }, [
    packageInfo?.default_view,
    arePackageFilesFetched,
    circuitJsonExists,
    isCircuitJsonLoading,
    fileBrowserMode,
  ])

  const importantFilePaths = packageFiles
    ?.filter((pf) => isPackageFileImportant(pf.file_path))
    ?.map((pf) => pf.file_path)

  // We've moved the directory and file computation to the FilesView component

  // Find important files based on importantFilePaths
  const importantFiles = useMemo(() => {
    if (!packageFiles || !importantFilePaths) return []

    return packageFiles
      .filter((file) =>
        importantFilePaths.some((path) => file.file_path === path),
      )
      .sort((a, b) => {
        const aImportance = scorePackageFileImportance(a.file_path)
        const bImportance = scorePackageFileImportance(b.file_path)
        return aImportance - bImportance
      })
      .reverse()
  }, [packageFiles, importantFilePaths])

  const renderFilesContent = () => {
    if (fileBrowserMode === "file") {
      return (
        <PackageFileView
          packageReleaseId={packageRelease?.package_release_id}
          filePath={fileBrowserPath}
          packageFiles={packageFiles}
          onDirectoryClicked={onDirectoryClicked}
          onOpenInEditor={() => onEditClicked?.(fileBrowserPath)}
        />
      )
    }

    return (
      <FilesView
        packageFiles={packageFiles}
        arePackageFilesFetched={arePackageFilesFetched}
        packageFilesError={packageFilesError}
        onFileClicked={onFileClicked}
        activeDirectory={fileBrowserMode === "directory" ? fileBrowserPath : ""}
        onDirectoryClicked={onDirectoryClicked}
      />
    )
  }

  // Render the appropriate content based on the active view
  const renderContent = () => {
    switch (activeView) {
      case "files":
        return renderFilesContent()
      case "3d":
        return <ThreeDView />
      case "pcb":
        return <PCBView />
      case "schematic":
        return <SchematicView />
      case "bom":
        return <BOMView />
      default:
        return renderFilesContent()
    }
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
    if (fileBrowserMode) {
      if (view !== "files") onFileBrowserViewChange?.(view)
      return
    }
    window.location.hash = view
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-sans">
      <Header />
      <PackageHeader
        packageInfo={packageInfo}
        packageRelease={packageRelease}
        isPrivate={packageInfo?.is_private ?? false}
        isCurrentUserAuthor={
          packageInfo?.creator_account_id === session?.github_username
        }
      />

      {/* Mobile Sidebar */}
      <div className="max-w-[1200px] mx-auto">
        <MobileSidebar
          onViewChange={handleViewChange}
          isLoading={!packageInfo}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:flex-1 border-r border-gray-200 dark:border-[#30363d] p-4 md:max-w-[calc(100%-296px)] max-w-full">
            {/* Main Content Header with Tabs */}
            <MainContentHeader
              activeView={activeView}
              packageFiles={packageFiles ?? []}
              onViewChange={handleViewChange}
              packageInfo={packageInfo}
              currentVersion={currentVersion}
              latestVersion={latestVersion}
              onVersionChange={onVersionChange}
              packageRelease={packageRelease}
            />

            {/* Dynamic Content based on active view */}
            {renderContent()}
            {fileBrowserMode !== "file" && (
              <ImportantFilesView
                importantFiles={importantFiles}
                isFetched={arePackageFilesFetched}
                pkg={packageInfo}
                onEditClicked={onEditClicked}
                onRequestAiDescriptionUpdate={() => {
                  if (packageInfo) {
                    updateAiDescription({
                      package_id: packageInfo.package_id,
                    })
                  }
                }}
                onLicenseFileRequested={licenseFileRequested}
              />
            )}
          </div>

          <div className="hidden md:block md:w-[296px] flex-shrink-0">
            <Sidebar
              packageInfo={packageInfo}
              isLoading={!packageInfo}
              onViewChange={handleViewChange}
              onLicenseClick={handleLicenseFileRequest}
            />
          </div>
          <div className="block md:hidden w-full px-5">
            <SidebarReleasesSection />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
