import { expect, test } from "@playwright/test"

const editorUrl = "http://127.0.0.1:5177/editor?template=blank-circuit-board"

test("local autosave preference can be disabled and survives reload", async ({
  page,
}) => {
  await page.goto(editorUrl)

  const toggle = page.getByRole("switch", { name: "Local AutoSave" })
  await expect(toggle).toBeVisible()
  await expect(toggle).toBeChecked()

  await toggle.click()
  await expect(toggle).not.toBeChecked()
  expect(
    await page.evaluate(() =>
      window.localStorage.getItem("tscircuit:editor:local-autosave:enabled"),
    ),
  ).toBe("false")

  await page.reload()
  await expect(toggle).toBeVisible()
  await expect(toggle).not.toBeChecked()

  await toggle.click()
  await expect(toggle).toBeChecked()
})

test("browser autosave preserves edits without creating a package build", async ({
  page,
}) => {
  let packageBuildCalls = 0
  await page.route("**/api/package_releases/**", async (route) => {
    if (route.request().method() === "POST") packageBuildCalls += 1
    await route.continue()
  })
  await page.route("**/api/package_builds/**", async (route) => {
    if (route.request().method() === "POST") packageBuildCalls += 1
    await route.continue()
  })

  await page.goto(editorUrl)
  const toggle = page.getByRole("switch", { name: "Local AutoSave" })
  await expect(toggle).toBeChecked()
  await page.locator(".monaco-editor").first().click()
  await page.keyboard.press("Control+End")
  await page.keyboard.insertText("\n// a disposable local autosave test")

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const key = Object.keys(window.localStorage).find((key) =>
          key.startsWith("tscircuit:editor:local-draft:v1:"),
        )
        return key ? window.localStorage.getItem(key) : null
      }),
    )
    .toContain("a disposable local autosave test")

  expect(packageBuildCalls).toBe(0)
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Restore local draft?" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Restore draft" }).click()
  await expect(
    page.getByRole("heading", { name: "Restore local draft?" }),
  ).not.toBeVisible()
})
