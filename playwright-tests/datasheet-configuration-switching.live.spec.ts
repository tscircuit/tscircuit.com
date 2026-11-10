import { expect, test, type Request } from "@playwright/test"
import { createHash } from "node:crypto"

test.skip(
  !process.env.TSCIRCUIT_LIVE_URL,
  "Set TSCIRCUIT_LIVE_URL to the deployment under review",
)

const release = "ecc81c3e-552e-4a51-af6e-f086ab62888d"
const url = `/datasheets/CC2340R52E0RGER?reference_release=${release}&reference_view=3d&reference_design=ShiboSoftwareDev%2Fcc2340r5-reference-design#reference-designs`
const configurations = [
  ["Default", "dist/index/circuit.json", 27],
  ["Internal LF clock", "dist/index/internal_lf_clock/circuit.json", 24],
  ["Minimal", "dist/index/minimal/circuit.json", 23],
] as const

// These tests use the published package and real registry responses.
test("cached configurations switch offline without replacing the 3D canvas", async ({
  page,
  context,
}, testInfo) => {
  await page.addInitScript(() =>
    localStorage.setItem("cadViewerAutoRotate", "false"),
  )
  const downloaded = new Set<string>()
  page.on("response", (response) => {
    if (!response.ok()) return
    for (
      let request: Request | null = response.request();
      request;
      request = request.redirectedFrom()
    ) {
      const url = new URL(request.url())
      if (url.pathname.endsWith("/package_files/download"))
        downloaded.add(url.searchParams.get("package_file_id")!)
    }
  })
  const fileList = page.waitForResponse(
    (response) =>
      response.ok() && response.url().includes("/package_files/list?"),
  )
  await page.goto(url, { timeout: 60_000 })
  const { package_files: files } = await (await fileList).json()
  const region = page.getByRole("region", { name: "Reference designs" })
  await region.scrollIntoViewIfNeeded()
  const picker = region.getByRole("combobox", { name: "Configuration" })
  const canvas = region.locator("canvas:visible").last()
  await expect(canvas).toBeVisible()
  for (const [, path] of configurations) {
    const glb = files.find(
      (file: any) => file.file_path === path.replace("circuit.json", "3d.glb"),
    )
    await expect.poll(() => downloaded.has(glb.package_file_id)).toBe(true)
  }
  await canvas.evaluate((element) =>
    element.setAttribute("data-persistent-scene", "true"),
  )
  await page.evaluate(() => {
    const region = document.querySelector("#reference-designs")!
    const scene = region.querySelector("[data-persistent-scene]")!
    ;(window as any).switchFailures = []
    const check = () => {
      if (!scene.isConnected)
        (window as any).switchFailures.push("canvas removed")
      for (const element of region.querySelectorAll("div,p")) {
        if (
          element.children.length === 0 &&
          /^Loading (?:reference design|3D view|PCB view|schematic view)/.test(
            element.textContent?.trim() || "",
          ) &&
          element.checkVisibility()
        )
          (window as any).switchFailures.push("visible loader")
      }
      ;(window as any).switchFrame = requestAnimationFrame(check)
    }
    check()
  })
  await context.setOffline(true)
  const pictures = new Set<string>()
  for (const [label, path, count] of [...configurations, ...configurations]) {
    await picker.click()
    await page.getByRole("option", { name: label, exact: true }).click()
    await expect(picker).toHaveText(label)
    await expect(page).toHaveURL(
      new RegExp(`reference_file=${encodeURIComponent(path)}`),
    )
    await expect(
      region.locator('canvas[data-persistent-scene="true"]'),
    ).toBeVisible()
    // Wait for the new GLB to finish parsing, including its hidden transition status.
    await expect(
      region
        .getByRole("status", { includeHidden: true })
        .filter({ hasText: "Loading 3D view" }),
    ).toHaveCount(0)
    const image = await canvas.screenshot()
    if (pictures.size < 3)
      pictures.add(createHash("sha256").update(image).digest("hex"))
    await region.getByRole("button", { name: "Schematic", exact: true }).click()
    // Multi-unit symbols can render several SVG groups for one component.
    await expect
      .poll(() =>
        region
          .locator("[data-schematic-component-id]")
          .evaluateAll(
            (elements) =>
              new Set(
                elements.map((element) =>
                  element.getAttribute("data-schematic-component-id"),
                ),
              ).size,
          ),
      )
      .toBe(count)
    await region.getByRole("button", { name: "PCB", exact: true }).click()
    await expect(region.locator("canvas:visible").last()).toBeVisible()
    await region.getByRole("button", { name: "3D", exact: true }).click()
    await expect(
      region.locator('canvas[data-persistent-scene="true"]'),
    ).toBeVisible()
  }
  expect(pictures.size).toBe(3)
  expect(await page.evaluate(() => (window as any).switchFailures)).toEqual([])
  await region.screenshot({
    path: testInfo.outputPath("seamless-configurations.png"),
  })
  await context.setOffline(false)
})

test("a cold configuration keeps the current scene and label until real downloads finish", async ({
  page,
}, testInfo) => {
  let releaseDownloads!: () => void
  const gate = new Promise<void>((resolve) => {
    releaseDownloads = resolve
  })
  let targetId: string | undefined
  let delayed = false
  // Delay the real registry request, without supplying a replacement response.
  await page.route("**/package_files/download?*", async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("package_file_id") ===
      targetId
    ) {
      delayed = true
      await gate
    }
    await route.continue()
  })
  page.on("response", async (response) => {
    if (response.ok() && response.url().includes("/package_files/list?")) {
      const { package_files: files } = await response.json()
      targetId = files.find(
        (file: any) => file.file_path === "dist/index/minimal/3d.glb",
      )?.package_file_id
    }
  })
  await page.goto(url, { timeout: 60_000 })
  const region = page.getByRole("region", { name: "Reference designs" })
  await region.scrollIntoViewIfNeeded()
  const picker = region.getByRole("combobox", { name: "Configuration" })
  const canvas = region.locator("canvas:visible").last()
  await expect(canvas).toBeVisible()
  await canvas.evaluate((element) =>
    element.setAttribute("data-persistent-scene", "true"),
  )
  await expect.poll(() => delayed).toBe(true)
  await picker.click()
  await page.getByRole("option", { name: "Minimal", exact: true }).click()
  await expect(picker).toHaveAttribute("aria-busy", "true")
  await expect(picker).toHaveText("Default")
  await expect(
    region.locator('canvas[data-persistent-scene="true"]'),
  ).toBeVisible()
  await expect(
    region.getByText(/^Loading/).filter({ visible: true }),
  ).toHaveCount(0)
  expect(new URL(page.url()).searchParams.get("reference_file")).toBeNull()
  releaseDownloads()
  await expect(picker).toHaveText("Minimal")
  await expect(picker).toHaveAttribute("aria-busy", "false")
  await expect(
    region.locator('canvas[data-persistent-scene="true"]'),
  ).toBeVisible()
  await expect(
    region
      .getByRole("status", { includeHidden: true })
      .filter({ hasText: "Loading 3D view" }),
  ).toHaveCount(0)
  await region.screenshot({
    path: testInfo.outputPath("cold-switch-complete.png"),
  })
})
