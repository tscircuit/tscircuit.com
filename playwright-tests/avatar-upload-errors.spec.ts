import { expect, test } from "@playwright/test"

const avatar = {
  name: "avatar.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=",
    "base64",
  ),
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "session_store",
      JSON.stringify({
        state: {
          session: {
            token: "avatar-upload-test",
            account_id: "account-1234",
            session_id: "session-1234",
            github_username: "testuser",
            tscircuit_handle: "testuser",
          },
        },
        version: 0,
      }),
    )
  })

  await Promise.all([
    page.waitForResponse("**/orgs/get?org_id=org-1234"),
    page.goto("http://127.0.0.1:5177/settings"),
  ])
  await page.getByRole("button", { name: "Update avatar" }).click()
  const dialog = page.getByRole("dialog")
  const fileChooserPromise = page.waitForEvent("filechooser")
  await dialog.locator('input[type="file"]').click()
  await (await fileChooserPromise).setFiles(avatar)
  await expect(dialog.getByText(avatar.name)).toBeVisible()
})

for (const { name, status, body, message } of [
  {
    name: "a top-level API rejection reason",
    status: 400,
    body: JSON.stringify({ message: "The image could not be read." }),
    message: "The image could not be read.",
  },
  {
    name: "a nested API rejection reason",
    status: 400,
    body: JSON.stringify({ error: { message: "Avatar file is empty" } }),
    message: "Avatar file is empty",
  },
  {
    name: "an upload size rejection without JSON",
    status: 413,
    body: "Payload Too Large",
    message:
      "The image is too large to upload. Choose a smaller image (up to 5MB).",
  },
  {
    name: "a server failure without a message",
    status: 503,
    body: "",
    message: "The server couldn't save your avatar. Please try again later.",
  },
]) {
  test(`shows ${name} in the dialog and toast`, async ({ page }) => {
    await page.route("**/orgs/upload_avatar", (route) =>
      route.fulfill({ status, body }),
    )
    const dialog = page.getByRole("dialog")
    await dialog.getByRole("button", { name: "Save avatar" }).click()

    await expect(dialog.getByRole("alert")).toHaveText(message)
    await expect(page.getByText(message, { exact: true })).toHaveCount(2)
    await expect(dialog.getByText(avatar.name)).toBeVisible()
    await expect(
      dialog.getByRole("button", { name: "Save avatar" }),
    ).toBeEnabled()
  })
}

test("explains a network failure and lets the user retry the selected image", async ({
  page,
}) => {
  await page.route("**/orgs/upload_avatar", (route) => route.abort("failed"))
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("button", { name: "Save avatar" }).click()

  await expect(dialog.getByRole("alert")).toHaveText(
    "Unable to reach the upload server. Check your internet connection and try again.",
  )

  await page.unroute("**/orgs/upload_avatar")
  await dialog.getByRole("button", { name: "Save avatar" }).click()
  await expect(page.getByText("Avatar updated", { exact: true })).toBeVisible()
  await expect(dialog).not.toBeVisible()
})
