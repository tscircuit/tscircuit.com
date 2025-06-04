"use client"

import { useState } from "react"
import { BuildPreviewContent } from "./build-preview-content"
import { PackageBuildDetailsPanel } from "./package-build-details-panel"
import { PackageBuildHeader } from "./package-build-header"
import { CollapsibleSection } from "./collapsible-section"

export const PackageBuildDetailsPage = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <PackageBuildHeader />

      <div className="px-6 py-6 container mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
          {/* Preview Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center max-h-[420px]">
              <BuildPreviewContent />
            </div>
          </div>

          {/* Details Panel */}
          <PackageBuildDetailsPanel />
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4 mb-8">
          <CollapsibleSection
            title="Transpilation Logs"
            duration="1m 15s"
            isOpen={openSections.summary}
            onToggle={() => toggleSection("summary")}
          />

          <CollapsibleSection
            title="Circuit JSON Build Logs"
            duration="2m 29s"
            isOpen={openSections.logs}
            onToggle={() => toggleSection("logs")}
          />
        </div>
      </div>
    </div>
  )
}
