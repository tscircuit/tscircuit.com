import { beforeAll, expect, test } from "bun:test"
import { SystemBlockViewer } from "@tscircuit/system-block-viewer"
import type { CircuitJson } from "circuit-json"
import { renderToStaticMarkup } from "react-dom/server"

const classicF1I2c: CircuitJson = [
  {
    type: "system_block_page",
    system_block_page_id: "classic-f1",
    display_name: "Classic F1 I²C",
    width: 112,
    height: 36,
  },
  {
    type: "system_block_component",
    system_block_component_id: "controller",
    system_block_page_id: "classic-f1",
    display_name: "RP2040",
    description: "Decodes rotation and counts turns",
    center: { x: -32, y: 0 },
    width: 32,
    height: 19,
  },
  {
    type: "system_block_component",
    system_block_component_id: "storage",
    system_block_page_id: "classic-f1",
    display_name: "FRAM",
    description: "32 KB retains the turn count",
    center: { x: 32, y: 0 },
    width: 32,
    height: 19,
  },
  {
    type: "system_block_connection",
    system_block_connection_id: "i2c",
    system_block_page_id: "classic-f1",
    from_system_block_component_id: "controller",
    to_system_block_component_id: "storage",
    route: [
      { x: -16, y: 0 },
      { x: 16, y: 0 },
    ],
    label: "I²C",
    label_anchor_center: { x: 0, y: 0 },
    is_signal: true,
    is_power: false,
    direction: "both",
  },
]

let labelSvg: string

beforeAll(async () => {
  const markup = renderToStaticMarkup(
    <SystemBlockViewer circuitJson={classicF1I2c} />,
  )
  const encodedSvg = markup.match(
    /src="data:image\/svg\+xml;charset=utf-8,([^"]+)"/,
  )?.[1]
  expect(encodedSvg).toBeDefined()
  const svg = decodeURIComponent(encodedSvg!)
  const snapshot = new URL(
    "./__snapshots__/system-block-connection-label.snap.svg",
    import.meta.url,
  )
  if (process.env.BUN_UPDATE_SNAPSHOTS === "1") {
    await Bun.write(snapshot, svg)
  }
  expect(svg).toBe(await Bun.file(snapshot).text())

  const label = svg.match(/<text [^>]*>I²C<\/text>/)?.[0]
  expect(label).toBeDefined()
  labelSvg = label!
})

test.failing("clears the wire behind the centered Classic F1 I²C label", () => {
  expect(labelSvg).toContain('y="18"')
  expect(labelSvg).toContain('paint-order="stroke fill"')
})
