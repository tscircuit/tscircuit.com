"use client"

import { useState } from "react"
import SidebarAboutSection from "./sidebar-about-section"
import SidebarReleasesSection from "./sidebar-releases-section"
import PreviewImageSquares from "./preview-image-squares"

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

interface SidebarProps {
  packageInfo?: PackageInfo
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
      <SidebarAboutSection packageInfo={packageInfo} isLoading={isLoading} />
      <PreviewImageSquares
        packageInfo={packageInfo}
        onViewChange={onViewChange}
      />
      <SidebarReleasesSection />
    </div>
  )
}
