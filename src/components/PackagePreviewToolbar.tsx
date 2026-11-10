import { ExternalLink } from "lucide-react"
import { Button } from "./ui/button"

const views = [
  { id: "3d", label: "3D" },
  { id: "pcb", label: "PCB" },
  { id: "schematic", label: "Schematic" },
]

export function PackagePreviewToolbar({
  view = "schematic",
  onViewChange,
  packageUrl,
  disabled = false,
  hidePackageLink = false,
}: {
  view?: string
  onViewChange?: (view: string) => void
  packageUrl?: string
  disabled?: boolean
  hidePackageLink?: boolean
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div
        className="flex gap-1 rounded-md bg-gray-100 p-1"
        role="group"
        aria-label="Circuit view"
      >
        {views.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={view === item.id ? "outline" : "ghost"}
            disabled={disabled}
            aria-pressed={view === item.id}
            onClick={() => onViewChange?.(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {!hidePackageLink && (
        <a
          href={packageUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!packageUrl}
          title="Open package in a new tab"
          className={`inline-flex items-center gap-1 text-sm font-medium ${packageUrl ? "text-blue-600 hover:underline" : "text-gray-400"}`}
        >
          Open package{" "}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  )
}
