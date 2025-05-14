"use client"

import { Package } from "fake-snippets-api/lib/db/schema"
import SidebarAboutSection from "./sidebar-about-section"
import SidebarReleasesSection from "./sidebar-releases-section"
import PreviewImageSquares from "./preview-image-squares"

interface SidebarProps {
  packageInfo?: Package
  isLoading?: boolean
  onViewChange?: (view: "3d" | "pcb" | "schematic") => void
}

export default function Sidebar({
  packageInfo,
  isLoading = false,
  onViewChange,
}: SidebarProps) {
  return (
    <div className="h-full p-4 bg-white dark:bg-[#0d1117] overflow-y-auto">
      <SidebarAboutSection />
      <PreviewImageSquares
        packageInfo={packageInfo}
        onViewChange={onViewChange}
      />
      <SidebarReleasesSection />
    </div>
  )
}
