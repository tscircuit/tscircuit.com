import type { AnyCircuitElement } from "circuit-json"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SourceGroup = Extract<AnyCircuitElement, { type: "source_group" }>
type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>
type PcbComponent = Extract<AnyCircuitElement, { type: "pcb_component" }>
type SchematicText = Extract<AnyCircuitElement, { type: "schematic_text" }>
type SchematicNoteKey = string
type ComponentKey = string
type SourceGroupId = string

export type CircuitComponentChange = {
  key: ComponentKey
  name: string
  kind: "modified" | "added" | "removed"
  schematic?: SchematicComponent
  pcb?: PcbComponent
}
export type PackageCircuitChanges = {
  components: CircuitComponentChange[]
  schematicTextIds: string[]
}
export const emptyCircuitChanges: PackageCircuitChanges = {
  components: [],
  schematicTextIds: [],
}
export const circuitChangeOutlineColor = "#3b82f6"

/** Generated IDs can shift when optional parts disappear. Compare authored content. */
function semanticFields(record: unknown): unknown {
  if (Array.isArray(record)) return record.map(semanticFields)
  if (!record || typeof record !== "object") return record
  return Object.fromEntries(
    Object.entries(record)
      .filter(([key]) => !/(?:^|_)ids?$/.test(key))
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, field]) => [key, semanticFields(field)]),
  )
}

function componentGroupPath({
  groups,
  sourceGroupId,
}: { groups: Map<SourceGroupId, SourceGroup>; sourceGroupId?: string }) {
  const names: string[] = []
  const visited = new Set<SourceGroupId>()
  while (sourceGroupId && !visited.has(sourceGroupId)) {
    visited.add(sourceGroupId)
    const group = groups.get(sourceGroupId)
    if (!group) break
    names.unshift(group.name ?? "")
    sourceGroupId = group.parent_source_group_id
  }
  return names
}

function indexComponents(circuitJson: readonly AnyCircuitElement[]) {
  const groups = new Map<SourceGroupId, SourceGroup>(
    circuitJson
      .filter(
        (element): element is SourceGroup => element.type === "source_group",
      )
      .map((group) => [group.source_group_id, group]),
  )
  const components = new Map<
    ComponentKey,
    {
      source: SourceComponent
      schematic?: SchematicComponent
      pcb?: PcbComponent
      signature: string
    }
  >()
  for (const source of circuitJson.filter(
    (element): element is SourceComponent =>
      element.type === "source_component",
  )) {
    const key = JSON.stringify([
      componentGroupPath({ groups, sourceGroupId: source.source_group_id }),
      source.name,
    ])
    const schematic = circuitJson.find(
      (element): element is SchematicComponent =>
        element.type === "schematic_component" &&
        element.source_component_id === source.source_component_id,
    )
    const pcb = circuitJson.find(
      (element): element is PcbComponent =>
        element.type === "pcb_component" &&
        element.source_component_id === source.source_component_id,
    )
    const models = circuitJson.filter(
      (element) =>
        element.type === "cad_component" &&
        element.source_component_id === source.source_component_id,
    )
    const labels = schematic
      ? circuitJson.filter(
          (element) =>
            element.type === "schematic_text" &&
            element.schematic_component_id === schematic.schematic_component_id,
        )
      : []
    components.set(key, {
      source,
      schematic,
      pcb,
      signature: JSON.stringify(
        semanticFields({ source, schematic, pcb, models, labels }),
      ),
    })
  }
  return components
}

function indexNotes(circuitJson: readonly AnyCircuitElement[]) {
  const notes = new Map<SchematicNoteKey, SchematicText>()
  for (const note of circuitJson.filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" && !element.schematic_component_id,
  )) {
    const key = JSON.stringify([
      note.position,
      note.anchor,
      note.rotation,
      note.font_size,
      note.schematic_sheet_id,
    ])
    notes.set(key, note)
  }
  return notes
}

export function getPackageCircuitChanges({
  previousCircuit,
  currentCircuit,
}: {
  previousCircuit: readonly AnyCircuitElement[]
  currentCircuit: readonly AnyCircuitElement[]
}): PackageCircuitChanges {
  const previous = indexComponents(previousCircuit)
  const current = indexComponents(currentCircuit)
  const components: CircuitComponentChange[] = []
  for (const key of new Set([...previous.keys(), ...current.keys()])) {
    const previousComponent = previous.get(key)
    const currentComponent = current.get(key)
    if (previousComponent?.signature === currentComponent?.signature) continue
    const component = currentComponent ?? previousComponent!
    components.push({
      key,
      name: component.source.name,
      kind: !previousComponent
        ? "added"
        : !currentComponent
          ? "removed"
          : "modified",
      schematic: component.schematic,
      pcb: component.pcb,
    })
  }
  const previousNotes = indexNotes(previousCircuit)
  const currentNotes = indexNotes(currentCircuit)
  const schematicTextIds = [...currentNotes]
    .filter(([key, note]) => previousNotes.get(key)?.text !== note.text)
    .map(([, note]) => note.schematic_text_id)
  return { components, schematicTextIds }
}

/** View-only outlines mark the previous location of removed symbols. */
export function getRemovedSchematicOutlines(
  changes: PackageCircuitChanges,
): AnyCircuitElement[] {
  return changes.components
    .filter((change) => change.kind === "removed" && change.schematic)
    .map((change, index) => {
      const component = change.schematic!
      const halfSize =
        Math.max(component.size.width, component.size.height) / 2 + 0.3
      const { x, y } = component.center
      return {
        type: "schematic_path",
        schematic_path_id: `preview_change_${index}`,
        schematic_sheet_id: component.schematic_sheet_id,
        points: [
          { x: x - halfSize, y: y - halfSize },
          { x: x + halfSize, y: y - halfSize },
          { x: x + halfSize, y: y + halfSize },
          { x: x - halfSize, y: y + halfSize },
          { x: x - halfSize, y: y - halfSize },
        ],
        is_dashed: true,
        dash_length: 0.15,
        dash_gap: 0.1,
        stroke_width: 0.06,
        stroke_color: circuitChangeOutlineColor,
      }
    })
}

export function getPcbChangeGraphics(changes: PackageCircuitChanges) {
  const rects = changes.components
    .filter((change) => change.pcb)
    .map((change) => ({
      center: change.pcb!.center,
      width: change.pcb!.width + 0.8,
      height: change.pcb!.height + 0.8,
      ccwRotationDegrees: change.pcb!.rotation,
      stroke: circuitChangeOutlineColor,
    }))
  return { rects }
}
