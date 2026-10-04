import { expect, test } from "@playwright/test"
import type { AnyCircuitElement } from "circuit-json"

const circuitJson: AnyCircuitElement[] = [
  {
    type: "pcb_board",
    pcb_board_id: "board",
    center: { x: 0, y: 0 },
    width: 16,
    height: 10,
    num_layers: 2,
    thickness: 1.6,
  },
  ...[-4, 4].map(
    (x, index): AnyCircuitElement => ({
      type: "pcb_plated_hole",
      pcb_plated_hole_id: `slot_${index}`,
      shape: "rotated_pill_hole_with_rect_pad",
      x,
      y: 0,
      layers: ["top", "bottom"],
      hole_shape: "rotated_pill",
      pad_shape: "rect",
      outer_width: 4,
      outer_height: 3,
      rect_pad_width: 4,
      rect_pad_height: 3,
      hole_width: 2.5,
      hole_height: 1,
      hole_ccw_rotation: 90,
      rect_ccw_rotation: 30,
    }),
  ),
]

declare global {
  interface Window {
    platedHoleWebGpu: { frames: number; errors: string[] }
  }
}

test.use({
  launchOptions: {
    args: [
      "--enable-unsafe-webgpu",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  },
})

test("package PCB renders rotated pill holes using the installed WebGPU worker", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.addInitScript(() => {
    window.platedHoleWebGpu = { frames: 0, errors: [] }
    const OriginalWorker = window.Worker
    window.Worker = class extends OriginalWorker {
      constructor(...args: ConstructorParameters<typeof Worker>) {
        super(...args)
        this.addEventListener("message", ({ data }) => {
          if (data.type === "rendered") window.platedHoleWebGpu.frames++
          if (data.type === "error")
            window.platedHoleWebGpu.errors.push(data.message)
        })
      }
    }
  })
  await page.route("**/package_releases/get_preview_circuit_json?*", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json_found: true,
          circuit_json: circuitJson,
        },
      },
    }),
  )
  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#pcb")
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            window.platedHoleWebGpu.frames > 0 ||
            window.platedHoleWebGpu.errors.length > 0,
        ),
      { timeout: 30_000 },
    )
    .toBe(true)
  expect(await page.evaluate(() => window.platedHoleWebGpu.errors)).toEqual([])
  expect(
    await page.evaluate(() => window.platedHoleWebGpu.frames),
  ).toBeGreaterThan(0)
  await expect(page.locator("[data-webgpu-error]")).toHaveCount(0)
  await expect(page.locator('[data-pcb-renderer="webgpu"]')).toBeVisible()
  await expect(page.locator(".pcb-webgpu-canvas")).toHaveScreenshot(
    "rotated-pill-holes.png",
    { maxDiffPixelRatio: 0.01 },
  )
})
