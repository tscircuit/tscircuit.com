import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
test("list packages with is_writable filter", async () => {
  const { axios, db } = await getTestServer()

  // Log the initial state of packages in the database
  console.log("LIST-2 TEST - Initial packages in DB:", db.packages)

  // Add test packages
  const packages = [
    {
      package_id: "pkg1",
      name: "Package1",
      unscoped_name: "Package1",
      owner_github_username: "testuser", // Matches auth context github_username
      creator_account_id: "account-1234", // Matches auth context account_id
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      description: "Description 1",
      ai_description: "AI Description 1",
      ai_usage_instructions: "Usage instructions 1",
      owner_org_id: "org-1234", // Matches auth context personal_org_id
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      star_count: 0,
    },
    {
      package_id: "pkg2",
      name: "Package2",
      unscoped_name: "Package2",
      owner_github_username: "user2",
      creator_account_id: "creator2",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
      description: "Description 2",
      ai_description: "AI Description 2",
      ai_usage_instructions: "Usage instructions 2",
      owner_org_id: "other-org",
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      star_count: 0,
    },
  ]

  // Add only these test packages
  for (const pkg of packages) {
    db.addPackage(pkg as any)
  }

  // Test with is_writable filter (requires auth)
  const { data: writableData } = await axios.get("/api/packages/list", {
    params: { is_writable: true },
    headers: {
      Authorization: "Bearer 1234",
    },
  })
  expect(writableData.packages).toHaveLength(1)
  expect(writableData.packages[0].owner_org_id).toBe("org-1234")
})
