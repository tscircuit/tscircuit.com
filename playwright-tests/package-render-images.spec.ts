import { test, expect, type Page } from "@playwright/test"

const url = "http://127.0.0.1:5177/testuser/my-test-board/settings?tab=renders"
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
)
const angles = ["angled", "top", "bottom"]
async function setup(page: Page, author = true) {
  await page.addInitScript(() =>
    localStorage.setItem(
      "session_store",
      JSON.stringify({
        state: {
          session: {
            token: "render-settings-test",
            account_id: "account-1234",
            github_username: "testuser",
            tscircuit_handle: "testuser",
          },
        },
        version: 0,
      }),
    ),
  )
  await page.route("**/package_files/list**", (route) =>
    route.fulfill({
      json: {
        package_files: [
          {
            package_file_id: "circuit",
            file_path: "dist/boards/controller/circuit.json",
          },
        ],
      },
    }),
  )
  await page.route("**/package_releases/get?**", (route) =>
    route.fulfill({
      json: {
        package_release: {
          package_release_id: "selected-release",
          version: "2.0.0",
        },
      },
    }),
  )
  if (!author)
    await page.addInitScript(() => {
      const store = JSON.parse(localStorage.getItem("session_store")!)
      store.state.session.account_id = "manager-account"
      localStorage.setItem("session_store", JSON.stringify(store))
    })
}

for (const viewport of [
  { width: 1280, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`generates all views, polls, restores on reload, and downloads authenticated PNGs at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await setup(page)
    const requests: any[] = []
    let status = "queued"
    const requested = new Set<string>()
    await page.route(
      "**/package_releases/create_render_image",
      async (route) => {
        const body = route.request().postDataJSON()
        requests.push(body)
        requested.add(body.angle)
        await route.fulfill({
          status: 202,
          json: {
            render_image: {
              package_release_render_image_id: body.angle,
              status,
              circuit_json_file_path: body.circuit_json_file_path,
            },
          },
        })
      },
    )
    await page.route(
      "**/package_releases/get_render_image?**",
      async (route) => {
        const angle = new URL(route.request().url()).searchParams.get("angle")!
        await route.fulfill(
          requested.has(angle)
            ? {
                json: {
                  render_image: {
                    package_release_render_image_id: angle,
                    status,
                    circuit_json_file_path:
                      "dist/boards/controller/circuit.json",
                  },
                },
              }
            : {
                status: 404,
                json: { error: { error_code: "render_image_not_found" } },
              },
        )
      },
    )
    const authenticatedImages = new Set<string>()
    await page.route(
      "**/package_releases/get_render_image_file?**",
      async (route) => {
        expect(route.request().headers().authorization).toBe(
          "Bearer render-settings-test",
        )
        authenticatedImages.add(
          new URL(route.request().url()).searchParams.get("angle")!,
        )
        await route.fulfill({ contentType: "image/png", body: png })
      },
    )
    await page.goto(url)
    await page.getByRole("button", { name: "Generate all three views" }).click()
    expect(requests.map((r) => r.angle).sort()).toEqual([...angles].sort())
    expect(
      requests.every(
        (r) =>
          r.package_release_id === "selected-release" &&
          r.circuit_json_file_path === "dist/boards/controller/circuit.json",
      ),
    ).toBe(true)
    await expect(
      page.getByRole("button", { name: "All views requested" }),
    ).toBeDisabled()
    await expect(
      page.getByRole("status").filter({ hasText: "Queued" }),
    ).toHaveCount(3)
    status = "running"
    await expect(
      page.getByRole("status").filter({ hasText: "Processing" }),
    ).toHaveCount(3, { timeout: 12000 })
    status = "succeeded"
    await expect(page.getByRole("img", { name: /rendered board/ })).toHaveCount(
      3,
      { timeout: 12000 },
    )
    expect([...authenticatedImages].sort()).toEqual([...angles].sort())
    for (const image of await page
      .getByRole("img", { name: /rendered board/ })
      .all())
      expect(
        await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
      ).toBeGreaterThan(0)
    await page.screenshot({
      path: test
        .info()
        .outputPath(`package-render-settings-${viewport.width}.png`),
      fullPage: true,
    })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page.reload()
    await expect(page.getByRole("img", { name: /rendered board/ })).toHaveCount(
      3,
    )
    expect(requests).toHaveLength(3)
    const download = page.waitForEvent("download")
    await page.getByRole("link", { name: "Download PNG" }).first().click()
    expect((await download).suggestedFilename()).toBe("angled.png")
  })
}

test("partial request errors can retry all three without losing existing renders; failures stay visible", async ({
  page,
}) => {
  await setup(page)
  const requested = new Set<string>()
  const calls: string[] = []
  let rejectTop = true
  await page.route("**/package_releases/get_render_image?**", (route) => {
    const angle = new URL(route.request().url()).searchParams.get("angle")!
    return route.fulfill(
      requested.has(angle)
        ? {
            json: {
              render_image: {
                status: angle === "bottom" ? "failed" : "queued",
                error: "The full rendering pipeline failed",
                circuit_json_file_path: "dist/boards/controller/circuit.json",
              },
            },
          }
        : {
            status: 404,
            json: { error: { error_code: "render_image_not_found" } },
          },
    )
  })
  await page.route("**/package_releases/create_render_image", (route) => {
    const { angle } = route.request().postDataJSON()
    calls.push(angle)
    if (angle === "top" && rejectTop)
      return route.fulfill({
        status: 503,
        json: { error: { message: "Temporarily unavailable" } },
      })
    requested.add(angle)
    return route.fulfill({
      json: {
        render_image: {
          status: angle === "bottom" ? "failed" : "queued",
          error: "The full rendering pipeline failed",
          circuit_json_file_path: "dist/boards/controller/circuit.json",
        },
      },
    })
  })
  await page.goto(url)
  await page.getByRole("button", { name: "Generate all three views" }).click()
  await expect(
    page.getByText("Request failed: Temporarily unavailable"),
  ).toBeVisible()
  await expect(
    page.getByRole("article", { name: "Bottom view" }).getByRole("status"),
  ).toHaveText("Failed")
  rejectTop = false
  await page.getByRole("button", { name: "Generate all three views" }).click()
  await expect(
    page.getByRole("button", { name: "All views requested" }),
  ).toBeDisabled()
  expect(calls.sort()).toEqual([...angles, ...angles].sort())
})

test("a package manager who is not the author can inspect status but cannot generate", async ({
  page,
}) => {
  await setup(page, false)
  await page.route("**/package_releases/get_render_image?**", (route) =>
    route.fulfill({
      json: {
        render_image: {
          status: "running",
          circuit_json_file_path: "dist/circuit.json",
        },
      },
    }),
  )
  await page.goto(url)
  await expect(
    page.getByText("Only the package author can generate render images.", {
      exact: false,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "All views requested" }),
  ).toBeDisabled()
  await expect(
    page.getByRole("status").filter({ hasText: "Processing" }),
  ).toHaveCount(3)
})

test("status lookup failures block generation until refreshed", async ({
  page,
}) => {
  await setup(page)
  let unavailable = true
  await page.route("**/package_releases/get_render_image?**", (route) =>
    route.fulfill(
      unavailable
        ? { status: 503, json: { error: { message: "Unavailable" } } }
        : {
            status: 404,
            json: { error: { error_code: "render_image_not_found" } },
          },
    ),
  )
  await page.goto(url)
  await expect(
    page.getByText("Could not check all render statuses.", { exact: false }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Generate all three views" }),
  ).toBeDisabled()
  unavailable = false
  await page.getByRole("button", { name: "Refresh status" }).click()
  await expect(
    page.getByRole("button", { name: "Generate all three views" }),
  ).toBeEnabled()
})

test("a release without built circuit JSON explains why generation is unavailable", async ({
  page,
}) => {
  await setup(page)
  await page.route("**/package_files/list**", (route) =>
    route.fulfill({ json: { package_files: [] } }),
  )
  await page.route("**/package_releases/get_render_image?**", (route) =>
    route.fulfill({
      status: 404,
      json: { error: { error_code: "render_image_not_found" } },
    }),
  )
  await page.goto(url)
  await expect(
    page.getByText("Build this release before generating render images.", {
      exact: false,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Generate all three views" }),
  ).toBeDisabled()
})

for (const author of [true, false]) {
  test(`individual render controls preserve other views and refresh image data (author=${author})`, async ({
    page,
  }) => {
    await setup(page, author)
    await page.setViewportSize({ width: 390, height: 844 })
    const rows: Record<string, any> = Object.fromEntries(
      angles.map((angle) => [
        angle,
        {
          package_release_render_image_id: `${angle}-old`,
          status: angle === "bottom" ? "failed" : "succeeded",
          error: "Pipeline failed: " + "long_error_detail_".repeat(150),
          circuit_json_file_path: "dist/boards/controller/circuit.json",
        },
      ]),
    )
    const requests: any[] = []
    const images: Record<string, number> = {}
    let reject = true
    await page.route("**/package_releases/get_render_image?**", (route) => {
      const angle = new URL(route.request().url()).searchParams.get("angle")!
      return route.fulfill({ json: { render_image: rows[angle] } })
    })
    await page.route(
      "**/package_releases/get_render_image_file?**",
      (route) => {
        const angle = new URL(route.request().url()).searchParams.get("angle")!
        images[angle] = (images[angle] || 0) + 1
        return route.fulfill({ contentType: "image/png", body: png })
      },
    )
    await page.route(
      "**/package_releases/create_render_image",
      async (route) => {
        const body = route.request().postDataJSON()
        requests.push(body)
        if (reject)
          return route.fulfill({
            status: 503,
            json: { error: { message: "Try again shortly" } },
          })
        rows[body.angle] = {
          ...rows[body.angle],
          status: "queued",
          error: null,
          package_release_render_image_id: `${body.angle}-new`,
        }
        await route.fulfill({
          status: 202,
          json: { render_image: rows[body.angle] },
        })
      },
    )
    await page.goto(url)
    const bottom = page.getByRole("article", { name: "Bottom view" })
    const top = page.getByRole("article", { name: "Top view" })
    await expect(
      top.getByRole("img", { name: "Top rendered board" }),
    ).toBeVisible()
    await expect(bottom.getByRole("status")).toHaveText("Failed")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    if (!author) {
      await expect(
        page.getByRole("button", {
          name: /^(Retry|Regenerate) (angled|top|bottom) image$/,
        }),
      ).toHaveCount(0)
      expect(requests).toHaveLength(0)
      return
    }
    await page.screenshot({
      path: test.info().outputPath("individual-render-controls.png"),
      fullPage: true,
    })
    await bottom.getByRole("button", { name: "Retry bottom image" }).click()
    await expect(
      bottom.getByText("Request failed: Try again shortly"),
    ).toBeVisible()
    await expect(top.getByRole("status")).toHaveText("Ready")
    reject = false
    await bottom.getByRole("button", { name: "Retry bottom image" }).click()
    await expect(bottom.getByRole("status")).toHaveText("Queued")
    await expect(
      bottom.getByRole("button", { name: "Retry bottom image" }),
    ).toHaveCount(0)
    expect(requests[1]).toEqual({
      package_release_id: "selected-release",
      angle: "bottom",
      retry_failed: true,
    })
    await top.getByRole("button", { name: "Regenerate top image" }).click()
    await expect(top.getByRole("status")).toHaveText("Queued")
    await expect(
      top.getByRole("img", { name: "Top rendered board" }),
    ).toHaveCount(0)
    expect(requests[2]).toEqual({
      package_release_id: "selected-release",
      angle: "top",
      regenerate: true,
    })
    rows.top.status = "succeeded"
    rows.bottom.status = "succeeded"
    await page.getByRole("button", { name: "Refresh status" }).click()
    await expect(
      top.getByRole("img", { name: "Top rendered board" }),
    ).toBeVisible()
    await expect.poll(() => images.top).toBe(2)
    expect(images.angled).toBe(1)
    expect(requests.map((r) => r.angle)).toEqual(["bottom", "bottom", "top"])
    await expect(
      page.getByText("Failed renders cannot be restarted", { exact: false }),
    ).toHaveCount(0)
  })
}
