import { expect, test } from "@playwright/test"
import { gzipSync, strToU8 } from "fflate"

const editorUrl = (files: Record<string, string>) => {
  const data = Buffer.from(gzipSync(strToU8(JSON.stringify(files)))).toString(
    "base64",
  )
  return `http://127.0.0.1:5177/editor#data:application/gzip;base64,${data}`
}

test("loads the project's bundled worker and reports missing bundles without falling back to latest", async ({
  page,
}) => {
  const requests: string[] = []
  await page.route(
    "**/npm/tscircuit@*/dist/webworker.min.js",
    async (route) => {
      requests.push(route.request().url())
      await route.fulfill({ status: 404, body: "Not found" })
    },
  )
  await page.goto(
    editorUrl({
      "index.circuit.tsx":
        'export default () => <board width="10mm" height="10mm" />',
      "package.json": JSON.stringify({
        devDependencies: { tscircuit: "~0.0.2600" },
      }),
      "package-lock.json": JSON.stringify({
        packages: { "node_modules/tscircuit": { version: "0.0.2617" } },
      }),
    }),
  )
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Could not load the tscircuit 0.0.2617 worker" }),
  ).toBeVisible()
  expect(requests).toEqual([
    "https://cdn.jsdelivr.net/npm/tscircuit@0.0.2617/dist/webworker.min.js",
  ])
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toHaveCount(0)
})

test("unresolved ranges explain how to make the runtime reproducible", async ({
  page,
}) => {
  await page.goto(
    editorUrl({
      "index.circuit.tsx": "export default () => <board />",
      "package.json": JSON.stringify({
        dependencies: { tscircuit: "^0.0.2617" },
      }),
    }),
  )
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Pin an exact tscircuit version" }),
  ).toBeVisible()
})

test("replaces the worker when the project runtime changes", async ({
  page,
}) => {
  const requests: string[] = []
  // A minimal Comlink worker keeps this lifecycle test independent of routing,
  // supplier APIs, and CDN availability. It accepts configuration RPCs.
  await page.route(
    "**/npm/tscircuit@*/dist/webworker.min.js",
    async (route) => {
      requests.push(route.request().url())
      await route.fulfill({
        contentType: "application/javascript",
        body: `
      self.onmessage = ({ data }) => {
        if (data.id) self.postMessage({ id: data.id, type: "RAW", value: undefined })
      }
    `,
      })
    },
  )
  await page.goto(
    editorUrl({
      "index.circuit.tsx": "export default () => <board />",
      "package.json": JSON.stringify({
        dependencies: { tscircuit: "0.0.2617" },
      }),
    }),
  )
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toBeVisible({ timeout: 30_000 })
  await page.evaluate(() => {
    const state = window as any
    state.oldProjectWorker = state.runFrameWorker
    state.oldProjectWorkerKilled = false
    const kill = state.runFrameWorker.kill.bind(state.runFrameWorker)
    state.runFrameWorker.kill = async () => {
      state.oldProjectWorkerKilled = true
      await kill()
    }
  })
  await page.getByText("package.json", { exact: true }).click()
  await page.getByRole("textbox").first().focus()
  await page.keyboard.press("ControlOrMeta+End")
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("Shift+ArrowLeft")
  await page.keyboard.insertText("8")
  await expect.poll(() => requests.length).toBe(2)
  await expect(
    page.getByRole("button", { name: "Run", exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => {
      const state = window as any
      return (
        state.oldProjectWorkerKilled &&
        state.runFrameWorker !== state.oldProjectWorker
      )
    }),
  ).toBe(true)
  expect(requests[1]).toContain("tscircuit@0.0.2618/dist/webworker.min.js")
})
