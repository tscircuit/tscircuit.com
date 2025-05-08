import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("list latest packages", async () => {
  const { axios, db } = await getTestServer()

  // Add some test packages
  const packages = [
    {
      name: "Package1",
      unscoped_name: "Package1",
      owner_github_username: "user1",
      creator_account_id: "creator1",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      description: "Description 1",
      ai_description: "AI Description 1",
      ai_usage_instructions: "Usage instructions 1",
      owner_org_id: "org1",
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      is_snippet: false,
    },
    {
      name: "Package2",
      unscoped_name: "Package2",
      owner_github_username: "user2",
      creator_account_id: "creator2",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
      description: "Description 2",
      ai_description: "AI Description 2",
      ai_usage_instructions: "Usage instructions 2",
      owner_org_id: "org2",
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      is_snippet: false,
    },
    {
      name: "Package3",
      unscoped_name: "Package3",
      owner_github_username: "user3",
      creator_account_id: "creator3",
      created_at: "2023-01-03T00:00:00Z",
      updated_at: "2023-01-03T00:00:00Z",
      description: "Description 3",
      ai_description: "AI Description 3",
      ai_usage_instructions: "Usage instructions 3",
      owner_org_id: "org3",
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      is_snippet: false,
    },
    // Add a snippet to verify it's filtered out
    {
      name: "Snippet1",
      unscoped_name: "Snippet1",
      owner_github_username: "user4",
      creator_account_id: "creator4",
      created_at: "2023-01-04T00:00:00Z",
      updated_at: "2023-01-04T00:00:00Z",
      description: "Snippet Description",
      ai_description: "AI Description",
      ai_usage_instructions: "Usage instructions",
      owner_org_id: "org4",
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      is_snippet: true,
    },
  ]

  // Add packages to the database
  for (const pkg of packages) {
    db.addPackage(pkg as any)
  }

  // Test the latest endpoint
  const { data } = await axios.get("/api/packages/list_latest")

  // Verify response structure
  expect(Array.isArray(data.packages)).toBe(true)
  expect(data.packages.length).toBe(3) // Should only return non-snippet packages

  // Verify that packages are sorted by creation date (newest first)
  for (let i = 1; i < data.packages.length; i++) {
    expect(
      new Date(data.packages[i - 1].created_at).getTime(),
    ).toBeGreaterThanOrEqual(new Date(data.packages[i].created_at).getTime())
  }

  // Verify that all returned packages have the required fields
  data.packages.forEach((pkg: any) => {
    expect(pkg).toHaveProperty("name")
    expect(pkg).toHaveProperty("unscoped_name")
    expect(pkg).toHaveProperty("owner_github_username")
    expect(pkg).toHaveProperty("creator_account_id")
    expect(pkg).toHaveProperty("latest_package_release_id")
    expect(pkg.is_snippet).toBe(false)
  })

  // Test with limit parameter
  const { data: limitedData } = await axios.get(
    "/api/packages/list_latest?limit=2",
  )
  expect(limitedData.packages.length).toBe(2)
})
