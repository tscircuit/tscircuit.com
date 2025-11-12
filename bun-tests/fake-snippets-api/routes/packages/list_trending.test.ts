import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("list trending packages", async () => {
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
    },
  ]

  // Add packages to the database
  for (const pkg of packages) {
    db.addPackage(pkg as any)
  }

  // Add stars to packages
  // Package1: 1 star
  db.addStar("user1", db.packages[0].package_id)

  // Package2: 3 stars
  db.addStar("user1", db.packages[1].package_id)
  db.addStar("user2", db.packages[1].package_id)
  db.addStar("user3", db.packages[1].package_id)

  // Package3: 2 stars
  db.addStar("user1", db.packages[2].package_id)
  db.addStar("user2", db.packages[2].package_id)

  // Test the trending endpoint
  const { data } = await axios.get("/api/packages/list_trending")

  // Verify response structure
  expect(data.ok).toBe(true)
  expect(Array.isArray(data.packages)).toBe(true)
  expect(data.packages.length).toBeGreaterThan(0)
  expect(data.packages.length).toBeLessThanOrEqual(10) // Should return at most 10 packages

  // Verify that packages with more stars appear first
  // Note: Since the endpoint randomizes the order after sorting by stars,
  // we can only verify that all returned packages have at least one star
  expect(
    data.packages.every((pkg: any) => {
      const starCount = db.accountPackages.filter(
        (ap) => ap.package_id === pkg.package_id && ap.is_starred,
      ).length
      return starCount > 0
    }),
  ).toBe(true)

  // Verify that all returned packages have the required fields
  data.packages.forEach((pkg: any) => {
    expect(pkg).toHaveProperty("name")
    expect(pkg).toHaveProperty("unscoped_name")
    expect(pkg).toHaveProperty("owner_github_username")
    expect(pkg).toHaveProperty("creator_account_id")
    expect(pkg).toHaveProperty("latest_package_release_id")
  })
})
