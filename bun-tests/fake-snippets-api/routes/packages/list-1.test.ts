import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("list packages", async () => {
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
      star_count: 0,
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
      star_count: 0,
    },
    {
      name: "Package3",
      unscoped_name: "Package3",
      owner_github_username: "user1",
      creator_account_id: "creator1",
      created_at: "2023-01-03T00:00:00Z",
      updated_at: "2023-01-03T00:00:00Z",
      description: "Description 3",
      ai_description: "AI Description 3",
      ai_usage_instructions: "Usage instructions 3",
      owner_org_id: "org1",
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      star_count: 0,
    },
  ]

  for (const pkg of packages) {
    db.addPackage(pkg as any)
  }

  // Test with no parameters (should return all packages)
  const { data: allData } = await axios.get("/api/packages/list")
  expect(allData.ok).toBe(true)
  expect(allData.packages).toHaveLength(3)

  // Test with owner_github_username parameter
  const { data: user1Data } = await axios.get("/api/packages/list", {
    params: { owner_github_username: "user1" },
  })
  expect(user1Data.packages).toHaveLength(2)
  expect(
    user1Data.packages.every(
      (pkg: { owner_github_username: string }) =>
        pkg.owner_github_username === "user1",
    ),
  ).toBe(true)

  // Test with creator_account_id parameter
  const { data: creator1Data } = await axios.get("/api/packages/list", {
    params: { creator_account_id: "creator1" },
  })
  expect(creator1Data.packages).toHaveLength(2)
  expect(
    creator1Data.packages.every(
      (pkg: { creator_account_id: string }) =>
        pkg.creator_account_id === "creator1",
    ),
  ).toBe(true)

  // Test with name parameter (must include another filter parameter)
  const { data: nameData } = await axios.get("/api/packages/list", {
    params: {
      name: "Package1",
      owner_github_username: "user1",
    },
  })
  expect(nameData.packages).toHaveLength(1)
  expect(nameData.packages[0].name).toBe("Package1")

  // Test with non-existent owner
  const { data: nonExistentData } = await axios.get("/api/packages/list", {
    params: { owner_github_username: "nonexistentuser" },
  })
  expect(nonExistentData.packages).toHaveLength(0)

  // Test with authenticated request
  const { data: authData } = await axios.get("/api/packages/list")
  expect(authData.packages).toHaveLength(3) // Should return all packages when authenticated
})
