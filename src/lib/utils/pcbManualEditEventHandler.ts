import type { ManualTraceHint } from "@tscircuit/layout"
import { getManualTraceHintFromEvent } from "@tscircuit/layout"
import type { EditEvent } from "@tscircuit/manual-edit-events"
import type {
  AnyCircuitElement,
  PcbComponent,
  SourceComponentBase,
} from "circuit-json"

export interface PCBPlacement {
  selector: string
  center: { x: number; y: number }
  relative_to: "group_center"
  _edit_event_id?: string
}

export interface ManualEditState {
  pcb_placements: PCBPlacement[]
  edit_events: EditEvent[]
  manual_trace_hints: ManualTraceHint[]
}

export const createInitialManualEditState = (): ManualEditState => ({
  pcb_placements: [],
  edit_events: [],
  manual_trace_hints: [],
})

export const applyPcbEditEvents = (
  changedEditEvents: EditEvent[],
  circuitJson: AnyCircuitElement[],
  manualEditsFileContent: Partial<ManualEditState> | null | undefined,
): ManualEditState => {
  try {
    // Ensure we have a valid state to work with
    const validState = ensureValidState(manualEditsFileContent)
    console.log("validState", validState)

    // Create a new state object with properly initialized arrays
    const newManualEditState: ManualEditState = {
      pcb_placements: [...validState.pcb_placements],
      edit_events: [...validState.edit_events],
      manual_trace_hints: [...validState.manual_trace_hints],
    }

    // Create a set of handled event IDs
    const handledEventIds = new Set<string>()

    // Add existing event IDs to the set
    newManualEditState.pcb_placements.forEach((placement) => {
      if (placement._edit_event_id) {
        handledEventIds.add(placement._edit_event_id)
      }
    })

    newManualEditState.edit_events.forEach((event) => {
      if (event.edit_event_id) {
        handledEventIds.add(event.edit_event_id)
      }
    })

    // Process new edit events
    for (const editEvent of changedEditEvents) {
      if (
        (editEvent.in_progress && !editEvent.edit_event_id) ||
        handledEventIds.has(editEvent.edit_event_id)
      )
        continue

      if (
        editEvent.pcb_edit_event_type === "edit_component_location" &&
        editEvent.pcb_component_id
      ) {
        // Find the component in the circuitJson
        const pcbComponent = circuitJson.find(
          (item: AnyCircuitElement) =>
            item.type === "pcb_component" &&
            item.pcb_component_id === editEvent.pcb_component_id,
        ) as PcbComponent

        if (!pcbComponent?.pcb_component_id) continue

        const nameofComponent = circuitJson.find(
          (item: AnyCircuitElement) =>
            item.type === "source_component" &&
            item.source_component_id === pcbComponent.source_component_id,
        ) as SourceComponentBase

        // Update or add placement
        const existingPlacementIndex =
          newManualEditState.pcb_placements.findIndex(
            (p) => p.selector === nameofComponent.name,
          )

        const newPlacement: PCBPlacement = {
          selector: nameofComponent.name,
          center: editEvent.new_center,
          relative_to: "group_center",
          _edit_event_id: editEvent.edit_event_id,
        }

        if (existingPlacementIndex !== -1) {
          // Update existing placement
          newManualEditState.pcb_placements[existingPlacementIndex] =
            newPlacement
        } else {
          // Add new placement
          newManualEditState.pcb_placements.push(newPlacement)
        }
      } else if (editEvent.pcb_edit_event_type === "edit_trace_hint") {
        const newTraceHint = getManualTraceHintFromEvent(circuitJson, editEvent)
        if (newTraceHint) {
          newManualEditState.manual_trace_hints = [
            ...newManualEditState.manual_trace_hints.filter(
              (th) => th.pcb_port_selector !== newTraceHint.pcb_port_selector,
            ),
            newTraceHint,
          ]
        }
      } else {
        // Add any other type of event to edit_events array
        newManualEditState.edit_events.push(editEvent)
      }

      handledEventIds.add(editEvent.edit_event_id)
    }

    return newManualEditState
  } catch (error) {
    console.error("Error handling edit events:", error)
    // Return a fresh state if there's an error
    return createInitialManualEditState()
  }
}

// Helper function to ensure we have a valid state
const ensureValidState = (
  manualEditState: Partial<ManualEditState> | null | undefined,
): ManualEditState => {
  if (!manualEditState) return createInitialManualEditState()

  return {
    pcb_placements: Array.isArray(manualEditState.pcb_placements)
      ? manualEditState.pcb_placements
      : [],
    edit_events: Array.isArray(manualEditState.edit_events)
      ? manualEditState.edit_events
      : [],
    manual_trace_hints: Array.isArray(manualEditState.manual_trace_hints)
      ? manualEditState.manual_trace_hints
      : [],
  }
}
