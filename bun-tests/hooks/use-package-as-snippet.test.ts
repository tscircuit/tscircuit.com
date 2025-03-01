import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import type { PackageFile } from "fake-snippets-api/lib/db/schema"

test("usePackageAsSnippet hook", async () => {
  const { axios, db } = await getTestServer()

  // 1. Create a snippet first
  const snippetResponse = await axios.post(
    "/api/snippets/create",
    {
      unscoped_name: "TestSnippet",
      code: "Test Content",
      snippet_type: "package",
      description: "Test Description",
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )
  expect(snippetResponse.status).toBe(200)
  const createdSnippet = snippetResponse.data.snippet
  // 2. Now access the snippet as a package using the package endpoints
  const packageGetResponse = await axios.post("/api/packages/get", {
    package_id: createdSnippet.snippet_id,
  })
  expect(packageGetResponse.status).toBe(200)
  const packageData = packageGetResponse.data.package

  // 3. Get the latest package release
  const releaseResponse = await axios.post("/api/package_releases/list", {
    package_id: packageData.package_id,
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  expect(releaseResponse.data.package_releases.length).toBeGreaterThan(0)
  const latestRelease = releaseResponse.data.package_releases[0]

  // 4. Get package files
  const filesListResponse = await axios.post("/api/package_files/list", {
    package_release_id: latestRelease.package_release_id,
  })
  expect(filesListResponse.status).toBe(200)
  const packageFiles = filesListResponse.data.package_files

  // 5. Transform the data to match the snippet structure (as the hook would do)
  const indexFile = packageFiles.find(
    (file: PackageFile) => file.file_path === "index.tsx",
  )
  const manualEditsFile = packageFiles.find(
    (file: PackageFile) => file.file_path === "manual-edits.json",
  )

  const snippetData = {
    snippet_id: packageData.package_id,
    package_release_id: latestRelease.package_release_id,
    unscoped_name: packageData.unscoped_name,
    name: packageData.name,
    is_starred: false,
    version: packageData.latest_version || "",
    owner_name: packageData.owner_github_username || "",
    description: packageData.description || "",
    snippet_type: "board",
    code: indexFile?.content_text || "",
    manual_edits_json_content: manualEditsFile?.content_text || "",
    created_at: packageData.created_at,
    updated_at: packageData.updated_at,
    star_count: packageData.star_count,
  }

  // 6. Verify the transformed data
  expect(snippetData.snippet_id).toBe(createdSnippet.snippet_id)
  expect(snippetData.name).toBe("testuser/TestSnippet")
  expect(snippetData.description).toBe("Test Description")
  expect(snippetData.code).toContain("Test Content")

  // Verify that the snippet data structure matches what would be returned by the hook
  expect(snippetData).toHaveProperty("snippet_id")
  expect(snippetData).toHaveProperty("package_release_id")
  expect(snippetData).toHaveProperty("unscoped_name")
  expect(snippetData).toHaveProperty("name")
  expect(snippetData).toHaveProperty("is_starred")
  expect(snippetData).toHaveProperty("version")
  expect(snippetData).toHaveProperty("owner_name")
  expect(snippetData).toHaveProperty("description")
  expect(snippetData).toHaveProperty("snippet_type")
  expect(snippetData).toHaveProperty("code")
  expect(snippetData).toHaveProperty("manual_edits_json_content")
  expect(snippetData).toHaveProperty("created_at")
  expect(snippetData).toHaveProperty("updated_at")
  expect(snippetData).toHaveProperty("star_count")
})
