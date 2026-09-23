import type { AnyCircuitElement } from "circuit-json"

/** Select Canvas before starting a GPU worker for known unsupported trace geometry. */
export function getPackagePcbRenderer(
  circuitJson: AnyCircuitElement[],
): "canvas" | "webgpu" {
  return circuitJson.some(
    (element) =>
      element.type === "pcb_trace" &&
      (element.route_thickness_mode === "interpolated" ||
        element.route.some((point) => point.route_type === "through_pad")),
  )
    ? "canvas"
    : "webgpu"
}
