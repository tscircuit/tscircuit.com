"use client"

import { useState } from "react"
import { BuildPreviewContent } from "./build-preview-content"
import { PackageBuildDetailsPanel } from "./package-build-details-panel"
import { PackageBuildHeader } from "./package-build-header"
import { CollapsibleSection } from "./collapsible-section"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { LogContent } from "./LogContent"
import { PackageRelease } from "fake-snippets-api/lib/db/schema"

function computeDuration(
  startedAt: string | null | undefined,
  completedAt: string | null | undefined,
) {
  if (!startedAt || !completedAt) return ""
  return `${Math.floor((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000)}s`
}

export const PackageBuildDetailsPage = () => {
  const { packageRelease } = useCurrentPackageRelease({ include_logs: true })
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const {
    circuit_json_build_logs,
    circuit_json_build_completed_at,
    circuit_json_build_in_progress,
    circuit_json_build_is_stale,
    circuit_json_build_started_at,
    circuit_json_build_error,
    circuit_json_build_error_last_updated_at,
    transpilation_completed_at,
    transpilation_in_progress,
    transpilation_is_stale,
    transpilation_logs,
    transpilation_started_at,
    circuit_json_build_display_status,
    transpilation_display_status,
    transpilation_error,
  } = packageRelease ?? ({} as Partial<PackageRelease>)

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
            duration={computeDuration(
              transpilation_started_at,
              transpilation_completed_at,
            )}
            displayStatus={transpilation_display_status}
            isOpen={openSections.summary}
            onToggle={() => toggleSection("summary")}
          >
            <LogContent
              logs={
                transpilation_logs ?? [
                  { message: "No transpilation logs available" },
                ]
              }
              error={transpilation_error}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Circuit JSON Build Logs"
            duration={computeDuration(
              circuit_json_build_started_at,
              circuit_json_build_completed_at,
            )}
            displayStatus={circuit_json_build_display_status}
            isOpen={openSections.logs}
            onToggle={() => toggleSection("logs")}
          >
            <LogContent
              logs={
                circuit_json_build_logs ?? [
                  { message: "No Circuit JSON logs available" },
                ]
              }
              error={circuit_json_build_error!}
            />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  )
}
