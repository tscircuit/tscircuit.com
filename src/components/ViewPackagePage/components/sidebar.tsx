"use client"

import { useState } from "react"
import SidebarAboutSection from "./sidebar-about-section"
import SidebarReleasesSection from "./sidebar-releases-section"
import ViewPlaceholders from "./view-placeholders"

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
}

export default function Sidebar({ packageInfo, isLoading = false }: SidebarProps) {
  const [activeView, setActiveView] = useState("code")

  return (
    <div className="h-full p-4 bg-white dark:bg-[#0d1117] overflow-y-auto">
      <SidebarAboutSection packageInfo={packageInfo} isLoading={isLoading} />
      <ViewPlaceholders onViewChange={setActiveView} />
      <SidebarReleasesSection isLoading={isLoading} />
    </div>
  )
}

