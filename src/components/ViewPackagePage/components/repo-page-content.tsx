"use client"

import { useEffect, useMemo, useState } from "react"
import ImportantFilesView from "./important-files-view"
import MainContentHeader from "./main-content-header"
import MobileSidebar from "./mobile-sidebar"
import Sidebar from "./sidebar"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useAiReview } from "@/hooks/use-ai-review"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useRequestAiReviewMutation } from "@/hooks/use-request-ai-review-mutation"
import { Package } from "fake-snippets-api/lib/db/schema"
import { useQueryClient } from "react-query"
import { useLocation } from "wouter"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"
import {
  isPackageFileImportant,
  scorePackageFileImportance,
} from "../utils/is-package-file-important"
import PackageHeader from "./package-header"
import SidebarReleasesSection from "./sidebar-releases-section"
import ThreeDView from "./tab-views/3d-view"
import BOMView from "./tab-views/bom-view"
// Tab Views
import FilesView from "./tab-views/files-view"
import PCBView from "./tab-views/pcb-view"
import SchematicView from "./tab-views/schematic-view"

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
  packageInfo?: Package
  packageRelease?: import("fake-snippets-api/lib/db/schema").PackageRelease
  onFileClicked?: (file: PackageFile) => void
  onEditClicked?: () => void
}

export default function RepoPageContent({
  packageFiles,
  packageInfo,
  packageRelease,
  onFileClicked,
  onEditClicked,
}: RepoPageContentProps) {
  const [activeView, setActiveView] = useState<string>("files")
  const [pendingAiReviewId, setPendingAiReviewId] = useState<string | null>(
    null,
  )
  const queryClient = useQueryClient()
  const { data: aiReview } = useAiReview(pendingAiReviewId, {
    refetchInterval: (data) => (data && !data.ai_review_text ? 2000 : false),
  })
  useEffect(() => {
    if (aiReview?.ai_review_text) {
      queryClient.invalidateQueries(["packageRelease"])
      setPendingAiReviewId(null)
    }
  }, [aiReview?.ai_review_text, queryClient])
  const session = useGlobalStore((s) => s.session)
  const { circuitJson, isLoading: isCircuitJsonLoading } =
    useCurrentPackageCircuitJson()
  const { mutate: requestAiReview, isLoading: isRequestingAiReview } =
    useRequestAiReviewMutation({
      onSuccess: (_packageRelease, aiReview) => {
        setPendingAiReviewId(aiReview.ai_review_id)
      },
    })

  const aiReviewRequested =
    Boolean(packageRelease?.ai_review_requested) ||
    Boolean(pendingAiReviewId) ||
    isRequestingAiReview

  // Handle initial view selection and hash-based view changes
  useEffect(() => {
    if (isCircuitJsonLoading) return
    if (!packageInfo) return
    const hash = window.location.hash.slice(1)
    const validViews = ["files", "3d", "pcb", "schematic", "bom"]
    const circuitDependentViews = ["3d", "pcb", "schematic", "bom"]

    const availableViews = circuitJson
      ? validViews
      : validViews.filter((view) => !circuitDependentViews.includes(view))

    if (hash && availableViews.includes(hash)) {
      setActiveView(hash)
    } else if (
      packageInfo?.default_view &&
      availableViews.includes(packageInfo.default_view)
    ) {
      setActiveView(packageInfo.default_view)
      window.location.hash = packageInfo.default_view
    } else {
      setActiveView("files")
      if (!hash || !availableViews.includes(hash)) {
        window.location.hash = "files"
      }
    }
  }, [packageInfo?.default_view, circuitJson, isCircuitJsonLoading])

  const importantFilePaths = packageFiles
    ?.filter((pf) => isPackageFileImportant(pf.file_path))
    ?.map((pf) => pf.file_path)

  // We've moved the directory and file computation to the FilesView component

  // Find important files based on importantFilePaths
  const importantFiles = useMemo(() => {
    if (!packageFiles || !importantFilePaths) return []

    return packageFiles
      .filter((file) =>
        importantFilePaths.some((path) => file.file_path.endsWith(path)),
      )
      .sort((a, b) => {
        const aImportance = scorePackageFileImportance(a.file_path)
        const bImportance = scorePackageFileImportance(b.file_path)
        return aImportance - bImportance
      })
      .reverse()
  }, [packageFiles, importantFilePaths])

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
        isPrivate={packageInfo?.is_private ?? false}
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
              packageFiles={packageFiles ?? []}
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
              packageAuthorOwner={packageInfo?.owner_github_username}
              aiDescription={packageInfo?.ai_description ?? ""}
              aiUsageInstructions={packageInfo?.ai_usage_instructions ?? ""}
              aiReviewText={packageRelease?.ai_review_text ?? null}
              aiReviewRequested={aiReviewRequested}
              onRequestAiReview={() => {
                if (packageRelease) {
                  requestAiReview({
                    package_release_id: packageRelease.package_release_id,
                  })
                }
              }}
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
          {/* Releases section - Only visible on small screens */}
          <div className="block md:hidden w-full px-5">
            <SidebarReleasesSection />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
