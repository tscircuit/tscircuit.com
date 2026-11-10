import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { getPackagePcbRenderer } from "@/lib/get-package-pcb-renderer"

const wire = { route_type: "wire", x: 0, y: 0, width: 0.2, layer: "top" }
const trace = (props: Record<string, unknown> = {}) =>
  ({
    type: "pcb_trace",
    pcb_trace_id: "trace_1",
    route: [wire],
    ...props,
  }) as AnyCircuitElement

test("ordinary traces keep the WebGPU backend", () => {
  expect(getPackagePcbRenderer([trace()])).toBe("webgpu")
  expect(getPackagePcbRenderer([])).toBe("webgpu")
})

test("interpolated traces use Canvas without a WebGPU startup/fallback cycle", () => {
  expect(
    getPackagePcbRenderer([
      trace(),
      trace({ route_thickness_mode: "interpolated" }),
    ]),
  ).toBe("canvas")
})

test("through-pad routes use Canvas even without interpolated thickness", () => {
  expect(
    getPackagePcbRenderer([
      trace({
        route: [
          wire,
          {
            route_type: "through_pad",
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
            width: 0.4,
            layer: "top",
          },
        ],
      }),
    ]),
  ).toBe("canvas")
})
