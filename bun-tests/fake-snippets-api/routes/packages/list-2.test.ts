import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
test("list packages with is_writable filter", async () => {
  const { axios, db } = await getTestServer()

  // Add test packages
  const packages = [
    {
      package_id: "pkg1",
      name: "testuser/testPackage1",
      unscoped_name: "testPackage1",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      description: "Description 1",
      ai_description: "AI Description 1",
      ai_usage_instructions: "Usage instructions 1",
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      star_count: 0,
    },
    {
      package_id: "pkg2",
      name: "testuser/testPackage2",
      unscoped_name: "testPackage2",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
      description: "Description 2",
      ai_description: "AI Description 2",
      ai_usage_instructions: "Usage instructions 2",
      latest_version: "1.0.0",
      license: "MIT",
      is_source_from_github: true,
      star_count: 0,
    },
  ]

  // Add only these test packages
  for (const pkg of packages) {
    await axios.post("/api/packages/create", pkg)
  }

  // Test with is_writable filter (requires auth)
  const { data: writableData } = await axios.get("/api/packages/list", {
    params: { is_writable: true },
  })
  expect(writableData.packages).toHaveLength(2)
})
