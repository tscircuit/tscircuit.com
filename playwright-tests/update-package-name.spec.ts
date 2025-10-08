import { test, expect } from "@playwright/test"

test("should update package name and refetch data", async ({ page }) => {
  const initialPackageName = "my-test-package"
  const updatedPackageName = "my-renamed-package"
  const author = "test-user"
  const packageId = "pkg_123"
  const releaseId = "rel_456"

  // Mock initial package data
  await page.route(
    `**/packages/get?package_name=${author}/${initialPackageName}`,
    (route) => {
      route.fulfill({
        status: 200,
        json: {
          package: {
            package_id: packageId,
            name: `${author}/${initialPackageName}`,
            unscoped_name: initialPackageName,
            owner_github_username: author,
            latest_package_release_id: releaseId,
            description: "Initial description",
            github_repo_full_name: null,
            website: "",
            is_private: false,
            default_view: "files",
            allow_pr_previews: false,
          },
        },
      })
    },
  )

  // Mock initial release data
  await page.route("**/package_releases/get", (route) => {
    const requestBody = route.request().postDataJSON()
    if (requestBody.package_id === packageId && requestBody.is_latest) {
      route.fulfill({
        status: 200,
        json: {
          package_release: {
            package_release_id: releaseId,
            // other release fields...
          },
        },
      })
    } else {
      route.continue()
    }
  })

  // Mock package update call
  await page.route("**/packages/update", (route) => {
    const requestBody = route.request().postDataJSON()
    if (
      requestBody.package_id === packageId &&
      requestBody.name === updatedPackageName
    ) {
      route.fulfill({
        status: 200,
        json: {
          // The update response doesn't need much data for this test
        },
      })
    } else {
      route.continue()
    }
  })

  // Mock the refetch of package data after the name change
  let packageRefetchCalled = false
  await page.route(
    `**/packages/get?package_name=${author}/${updatedPackageName}`,
    (route) => {
      packageRefetchCalled = true
      route.fulfill({
        status: 200,
        json: {
          package: {
            package_id: packageId,
            name: `${author}/${updatedPackageName}`,
            unscoped_name: updatedPackageName,
            owner_github_username: author,
            latest_package_release_id: releaseId,
            description: "Updated description",
            // ... other fields
          },
        },
      })
    },
  )

  // Mock the refetch of the release data, which will now use the new name
  let releaseRefetchCalled = false
  await page.route("**/package_releases/get", (route) => {
    const requestBody = route.request().postDataJSON()
    if (
      requestBody.package_name === `${author}/${updatedPackageName}` &&
      requestBody.is_latest
    ) {
      releaseRefetchCalled = true
      route.fulfill({
        status: 200,
        json: {
          package_release: {
            package_release_id: releaseId,
            // ...
          },
        },
      })
    } else {
      route.continue()
    }
  })

  // Start the test
  await page.goto(`/${author}/${initialPackageName}`)

  // Wait for the page to load and display the initial package name
  await expect(page.getByText(initialPackageName)).toBeVisible()

  // Open the edit dialog
  await page.getByRole("button", { name: "Edit package details" }).click()

  // Change the package name
  const nameInput = page.getByLabel("Package Name")
  await nameInput.fill(updatedPackageName)

  // Save the changes
  await page.getByRole("button", { name: "Save Changes" }).click()

  // Assertions
  // 1. The URL should be updated to the new package name
  await expect(page).toHaveURL(`/${author}/${updatedPackageName}`)

  // 2. The new package name should be displayed on the page
  await expect(page.getByText(updatedPackageName)).toBeVisible()

  // 3. The package and release data should have been refetched with the new name
  expect(packageRefetchCalled).toBe(true)
  expect(releaseRefetchCalled).toBe(true)
})
