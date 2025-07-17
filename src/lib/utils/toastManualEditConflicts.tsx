import type { ToasterToast } from "@/hooks/useToast"

export function toastManualEditConflicts(
  circuitJson: { type: string; message: string }[],
  toast: (props: Omit<ToasterToast, "id">) => void,
) {
  const pcb_manual_edit_conflict_warnings = circuitJson.filter(
    (x) => x.type === "pcb_manual_edit_conflict_warning",
  )
  const schematic_manual_edit_conflict_warnings = circuitJson.filter(
    (x) => x.type === "schematic_manual_edit_conflict_warning",
  )

  if (
    pcb_manual_edit_conflict_warnings.length > 0 ||
    schematic_manual_edit_conflict_warnings.length > 0
  ) {
    const warnings = [
      ...(pcb_manual_edit_conflict_warnings || []),
      ...(schematic_manual_edit_conflict_warnings || []),
    ]

    warnings.forEach((warning) => {
      const isSchematicWarning =
        warning.type === "schematic_manual_edit_conflict_warning"
      toast({
        title: !isSchematicWarning
          ? "Pcb Manual Edit Conflicts"
          : "Schematic Manual Edit Conflicts",
        description: (
          <div className="flex items-center">
            <span>{warning.message}</span>
          </div>
        ),
        variant: "destructive",
      })
    })
  }
}
