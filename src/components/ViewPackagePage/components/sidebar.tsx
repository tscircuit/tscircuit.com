import { Package } from "fake-snippets-api/lib/db/schema"
import SidebarAboutSection from "./sidebar-about-section"
import SidebarReleasesSection from "./sidebar-releases-section"
import PreviewImageSquares from "./preview-image-squares"

interface SidebarProps {
  packageInfo?: Package
  isLoading?: boolean
  onViewChange?: (view: "3d" | "pcb" | "schematic") => void
  onLicenseClick?: () => void
}

export default function Sidebar({
  packageInfo,
  onViewChange,
  onLicenseClick,
}: SidebarProps) {
  return (
    <div className="h-full p-4 bg-white dark:bg-[#0d1117] overflow-y-auto">
      <SidebarAboutSection onLicenseClick={onLicenseClick} />
      <PreviewImageSquares
        packageInfo={packageInfo}
        onViewChange={onViewChange}
      />
      <SidebarReleasesSection />
    </div>
  )
}
