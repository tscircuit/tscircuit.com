import { expect, test } from "bun:test"
import {
  getPackageCircuitChanges,
  getPcbChangeGraphics,
  getRemovedSchematicOutlines,
} from "@/lib/package-circuit-changes"
import type { AnyCircuitElement } from "circuit-json"

type ResistorFixture = {
  name: string
  index: number
  resistance?: number
  group?: string
}
const resistor = ({
  name,
  index,
  resistance = 1000,
  group,
}: ResistorFixture): AnyCircuitElement[] => [
  {
    type: "source_component",
    source_component_id: `source_${index}`,
    source_group_id: group,
    name,
    ftype: "simple_resistor",
    resistance,
  },
  {
    type: "schematic_component",
    source_component_id: `source_${index}`,
    schematic_component_id: `schematic_${index}`,
    center: { x: 2, y: 3 },
    size: { width: 1, height: 2 },
    is_box_with_pins: false,
    symbol_name: "resistor",
  },
  {
    type: "pcb_component",
    source_component_id: `source_${index}`,
    pcb_component_id: `pcb_${index}`,
    center: { x: 4, y: 5 },
    width: 1,
    height: 2,
    layer: "top",
    rotation: 0,
    obstructs_within_bounds: true,
  },
]

test("value differences find the actual part despite regenerated source and viewer IDs", () => {
  const previous = [
    ...resistor({ name: "R7", index: 1 }),
    ...resistor({ name: "R8", index: 2 }),
  ]
  const current = [
    ...resistor({ name: "R7", index: 10, resistance: 4700 }),
    ...resistor({ name: "R8", index: 20 }),
  ]
  const snapshot = JSON.stringify({ previous, current })
  const changes = getPackageCircuitChanges({
    previousCircuit: previous,
    currentCircuit: current,
  })
  expect(
    changes.components.map((change) => [change.name, change.kind]),
  ).toEqual([["R7", "modified"]])
  expect(getPcbChangeGraphics(changes).rects[0].center).toEqual({
    x: 4,
    y: 5,
  })
  expect(JSON.stringify({ previous, current })).toBe(snapshot)
})

test("removed parts have view-only previous-position outlines; added parts are distinct", () => {
  const populated = [
    ...resistor({ name: "R7", index: 1 }),
    ...resistor({ name: "R8", index: 2 }),
  ]
  const unpopulated = resistor({ name: "R7", index: 10 })
  const removed = getPackageCircuitChanges({
    previousCircuit: populated,
    currentCircuit: unpopulated,
  })
  expect(
    removed.components.map((change) => [change.name, change.kind]),
  ).toEqual([["R8", "removed"]])
  const outlines = getRemovedSchematicOutlines(removed)
  expect(outlines).toHaveLength(1)
  expect(outlines[0].type).toBe("schematic_path")
  expect(unpopulated).toHaveLength(3)
  const added = getPackageCircuitChanges({
    previousCircuit: unpopulated,
    currentCircuit: populated,
  })
  expect(added.components.map((change) => [change.name, change.kind])).toEqual([
    ["R8", "added"],
  ])
  expect(getRemovedSchematicOutlines(added)).toEqual([])
})

test("free annotations such as input voltage are matched by location, not generated text IDs", () => {
  const note = (id: string, text: string): AnyCircuitElement => ({
    type: "schematic_text",
    schematic_text_id: id,
    text,
    position: { x: 0, y: 0 },
    anchor: "left",
    rotation: 0,
    font_size: 0.2,
    color: "#000000",
  })
  const changes = getPackageCircuitChanges({
    previousCircuit: [note("old", "2.5 V input")],
    currentCircuit: [note("new", "3.3 V input")],
  })
  expect(changes.components).toEqual([])
  expect(changes.schematicTextIds).toEqual(["new"])
  expect(
    getPackageCircuitChanges({
      previousCircuit: [note("old", "2.5 V input")],
      currentCircuit: [note("new", "2.5 V input")],
    }).schematicTextIds,
  ).toEqual([])
})

test("identically named parts in named subcircuits keep separate identities", () => {
  const groups: AnyCircuitElement[] = [
    { type: "source_group", source_group_id: "first", name: "sensor" },
    { type: "source_group", source_group_id: "second", name: "power" },
  ]
  const changes = getPackageCircuitChanges({
    previousCircuit: [
      ...groups,
      ...resistor({ name: "R1", index: 1, group: "first" }),
      ...resistor({ name: "R1", index: 2, group: "second" }),
    ],
    currentCircuit: [
      ...groups,
      ...resistor({ name: "R1", index: 10, group: "first", resistance: 2000 }),
      ...resistor({ name: "R1", index: 20, group: "second" }),
    ],
  })
  expect(changes.components).toHaveLength(1)
  expect(changes.components[0].key).toContain("sensor")
})
