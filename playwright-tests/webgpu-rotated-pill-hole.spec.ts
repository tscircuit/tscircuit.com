import { expect, test } from "@playwright/test"

test.use({
  launchOptions: {
    args: [
      "--enable-unsafe-webgpu",
      "--use-angle=swiftshader",
      "--enable-features=Vulkan",
      "--disable-vulkan-surface",
      "--enable-dawn-features=allow_unsafe_apis",
    ],
  },
})

const rotatedPillHoleCircuitJson = [
  {
    type: "pcb_board",
    pcb_board_id: "pcb_board_0",
    center: { x: 0, y: 0 },
    width: 10,
    height: 10,
    thickness: 1.4,
    num_layers: 2,
  },
  {
    type: "pcb_plated_hole",
    pcb_plated_hole_id: "pcb_plated_hole_0",
    shape: "rotated_pill_hole_with_rect_pad",
    x: 0,
    y: 0,
    outer_width: 1.6,
    outer_height: 1.6,
    hole_width: 1.05,
    hole_height: 1.05,
    hole_shape: "rotated_pill",
    pad_shape: "rect",
    hole_ccw_rotation: 270,
    rect_ccw_rotation: 270,
    rect_pad_width: 1.6,
    rect_pad_height: 1.6,
    layers: ["top", "bottom"],
  },
]

test("reproduces WebGPU failure for rotated pill holes with rectangular pads", async ({
  page,
}) => {
  await page.route("**/package_releases/get_preview_circuit_json**", (route) =>
    route.fulfill({
      json: {
        preview_circuit_json_response: {
          circuit_json: rotatedPillHoleCircuitJson,
          circuit_json_found: true,
        },
      },
    }),
  )

  await page.goto("http://127.0.0.1:5177/testuser/my-test-board#pcb")

  await expect(page.getByText("WebGPU rendering failed")).toBeVisible()
  await expect(
    page.getByText(
      /Unsupported WebGPU geometry: pcb_plated_hole: Error: Unsupported shape: rotated_pill_hole_with_rect_pad/,
    ),
  ).toBeVisible()
})
