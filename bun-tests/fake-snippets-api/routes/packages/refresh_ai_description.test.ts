import { test, expect } from "bun:test"
import { getTestServer } from "../../fixtures/get-test-server"

test("POST /api/packages/refresh_ai_description should refresh AI description", async () => {
  const { axios, db } = await getTestServer()

  // Create a test account and package
  const account = db.addAccount({
    account_id: "test_account",
    github_username: "testuser",
  })

  const testPackage = db.addPackage({
    owner_github_username: "testuser",
    name: "testuser/test-package",
    unscoped_name: "test-package",
    description: "Test package",
    ai_description: "Original AI description",
    ai_usage_instructions: "Original usage instructions",
    creator_account_id: account.account_id,
    owner_org_id: account.account_id,
    created_at: new Date().toISOString(),
    latest_package_release_id: null,
    latest_version: null,
    license: null,
  })

  // Create a session for the test user
  const session = db.addSession({
    account_id: account.account_id,
    session_id: "test_session",
    expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    is_cli_session: false,
  })

  // Make the request to refresh AI description
  const response = await axios.post(
    "/api/packages/refresh_ai_description",
    {
      package_id: testPackage.package_id,
    },
    {
      headers: {
        Authorization: `Bearer ${session.session_id}`,
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.package).toBeDefined()
  expect(response.data.package.package_id).toBe(testPackage.package_id)

  // Verify that AI description was updated
  expect(response.data.package.ai_description).not.toBe(
    "Original AI description",
  )
  expect(response.data.package.ai_usage_instructions).not.toBe(
    "Original usage instructions",
  )
  expect(response.data.package.ai_description).toContain("test-package")
  expect(response.data.package.ai_usage_instructions).toContain("test-package")
})

test("POST /api/packages/refresh_ai_description should return 404 for non-existent package", async () => {
  const { axios, db } = await getTestServer()

  const account = db.addAccount({
    account_id: "test_account",
    github_username: "testuser",
  })

  const session = db.addSession({
    account_id: account.account_id,
    session_id: "test_session",
    expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    is_cli_session: false,
  })

  const response = await axios.post(
    "/api/packages/refresh_ai_description",
    {
      package_id: "non-existent-package",
    },
    {
      headers: {
        Authorization: `Bearer ${session.session_id}`,
      },
      validateStatus: () => true,
    },
  )

  expect(response.status).toBe(404)
  expect(response.data.error.error_code).toBe("package_not_found")
})

test("POST /api/packages/refresh_ai_description should return 403 for unauthorized user", async () => {
  const { axios, db } = await getTestServer()

  // Create package owner
  const packageOwner = db.addAccount({
    account_id: "package_owner",
    github_username: "packageowner",
  })

  const testPackage = db.addPackage({
    owner_github_username: "packageowner",
    name: "packageowner/test-package",
    unscoped_name: "test-package",
    description: "Test package",
    ai_description: "Original AI description",
    ai_usage_instructions: "Original usage instructions",
    creator_account_id: packageOwner.account_id,
    owner_org_id: packageOwner.account_id,
    created_at: new Date().toISOString(),
    latest_package_release_id: null,
    latest_version: null,
    license: null,
  })

  // Create different user trying to refresh
  const otherUser = db.addAccount({
    account_id: "other_user",
    github_username: "otheruser",
  })

  const session = db.addSession({
    account_id: otherUser.account_id,
    session_id: "test_session",
    expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    is_cli_session: false,
  })

  const response = await axios.post(
    "/api/packages/refresh_ai_description",
    {
      package_id: testPackage.package_id,
    },
    {
      headers: {
        Authorization: `Bearer ${session.session_id}`,
      },
      validateStatus: () => true,
    },
  )

  expect(response.status).toBe(403)
  expect(response.data.error.error_code).toBe("forbidden")
})
