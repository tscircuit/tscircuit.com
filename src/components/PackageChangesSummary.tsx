import { usePackagePreviewChanges } from "@/components/PackagePreviewChanges"
import { Button } from "@/components/ui/button"
import type { CircuitComponentChange } from "@/lib/package-circuit-changes"
import { X } from "lucide-react"

const labels = { modified: "Changed", added: "Added", removed: "Removed" }
const colors = {
  modified: "border-amber-300 bg-amber-50 text-amber-900",
  added: "border-green-300 bg-green-50 text-green-900",
  removed: "border-red-300 bg-red-50 text-red-900",
}

export function PackageChangesSummary({
  onShowComponent,
}: { onShowComponent: (change: CircuitComponentChange) => void }) {
  const changes = usePackagePreviewChanges()
  if (
    !changes ||
    (!changes.circuit.components.length &&
      !changes.circuit.schematicTextIds.length &&
      !changes.changedParameterIds.length)
  )
    return null
  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50/50 px-3 py-2"
      role="status"
      aria-label="Configuration changes"
    >
      <span className="text-xs font-medium text-gray-600">
        Highlighted changes
      </span>
      {changes.circuit.components.map((change) => (
        <Button
          variant="outline"
          size="sm"
          key={change.key}
          type="button"
          className={`h-7 gap-1 px-2 text-xs hover:underline ${colors[change.kind]}`}
          onClick={() => onShowComponent(change)}
          data-component-change={change.kind}
        >
          {change.name}{" "}
          <span className="font-normal">{labels[change.kind]}</span>
        </Button>
      ))}
      {changes.circuit.schematicTextIds.length > 0 && (
        <span className="text-xs text-amber-900">Annotations changed</span>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="ml-auto h-7 gap-1 text-xs"
        onClick={changes.clear}
      >
        <X className="h-3 w-3" />
        Clear highlights
      </Button>
    </div>
  )
}
