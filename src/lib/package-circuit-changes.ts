import type { AnyCircuitElement } from "circuit-json"

type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SourceGroup = Extract<AnyCircuitElement, { type: "source_group" }>
type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>
type SchematicText = Extract<AnyCircuitElement, { type: "schematic_text" }>
type SchematicNoteKey = string
type ComponentKey = string
type SourceGroupId = string

export type PackageCircuitChanges = {
  schematicComponentIds: string[]
  schematicTextIds: string[]
}
export const emptyCircuitChanges: PackageCircuitChanges = {
  schematicComponentIds: [],
  schematicTextIds: [],
}

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
    { schematic?: SchematicComponent; signature: string }
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
    const labels = schematic
      ? circuitJson.filter(
          (element) =>
            element.type === "schematic_text" &&
            element.schematic_component_id === schematic.schematic_component_id,
        )
      : []
    components.set(key, {
      schematic,
      signature: JSON.stringify(semanticFields({ source, schematic, labels })),
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

/** Report only schematic additions and changes still visible in the current circuit. */
export function getPackageCircuitChanges({
  previousCircuit,
  currentCircuit,
}: {
  previousCircuit: readonly AnyCircuitElement[]
  currentCircuit: readonly AnyCircuitElement[]
}): PackageCircuitChanges {
  const previous = indexComponents(previousCircuit)
  const current = indexComponents(currentCircuit)
  const schematicComponentIds: string[] = []
  for (const [key, currentComponent] of current) {
    const previousComponent = previous.get(key)
    if (previousComponent?.signature === currentComponent.signature) continue
    if (!currentComponent.schematic) continue
    schematicComponentIds.push(
      currentComponent.schematic.schematic_component_id,
    )
  }
  const previousNotes = indexNotes(previousCircuit)
  const currentNotes = indexNotes(currentCircuit)
  const schematicTextIds = [...currentNotes]
    .filter(([key, note]) => previousNotes.get(key)?.text !== note.text)
    .map(([, note]) => note.schematic_text_id)
  return { schematicComponentIds, schematicTextIds }
}
