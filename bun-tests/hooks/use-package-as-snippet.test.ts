import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import type { PackageFile } from "fake-snippets-api/lib/db/schema"

test("package as snippet integration test", async () => {
  const { axios, db } = await getTestServer()

  // 1. Create a package
  const packageResponse = await axios.post(
    "/api/packages/create",
    {
      name: "@test/component-package",
      description: "A test component package",
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // 2. Create a package release
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  // 3. Add package files including index.tsx and manual-edits.json
  const indexContent = `
import React from 'react';

export default function TestComponent() {
  return <div>Hello from test component</div>;
}
`
  const manualEditsContent = `{
  "version": 1,
  "edits": [
    {
      "type": "style",
      "selector": "div",
      "styles": {
        "color": "blue",
        "fontWeight": "bold"
      }
    }
  ]
}`

  // Add index.tsx file
  await axios.post("/api/package_files/create", {
    package_release_id: createdRelease.package_release_id,
    file_path: "/index.tsx",
    content_text: indexContent,
  })

  // Add manual-edits.json file
  await axios.post("/api/package_files/create", {
    package_release_id: createdRelease.package_release_id,
    file_path: "/manual-edits.json",
    content_text: manualEditsContent,
  })

  // Add another file (not used by the hook)
  await axios.post("/api/package_files/create", {
    package_release_id: createdRelease.package_release_id,
    file_path: "/README.md",
    content_text: "# Test Component\nThis is a test component.",
  })

  // 4. Simulate the usePackageAsSnippet hook by making the same API calls

  // First API call: Get package details
  const packageGetResponse = await axios.post("/api/packages/get", {
    package_id: createdPackage.package_id,
  })
  expect(packageGetResponse.status).toBe(200)
  const packageData = packageGetResponse.data.package

  // Second API call: Get package files
  const filesListResponse = await axios.post("/api/package_files/list", {
    package_release_id: createdRelease.package_release_id,
  })
  expect(filesListResponse.status).toBe(200)
  const packageFiles = filesListResponse.data.package_files

  // 5. Transform the data to match the snippet structure (as the hook would do)
  const indexFile = packageFiles.find(
    (file: PackageFile) => file.file_path === "/index.tsx",
  )
  const manualEditsFile = packageFiles.find(
    (file: PackageFile) => file.file_path === "/manual-edits.json",
  )

  const snippetData = {
    snippet_id: packageData.package_id,
    package_release_id: createdRelease.package_release_id,
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
  expect(snippetData.snippet_id).toBe(createdPackage.package_id)
  expect(snippetData.name).toBe("test/component-package")
  expect(snippetData.description).toBe("A test component package")
  expect(snippetData.code).toBe(indexContent)
  expect(snippetData.manual_edits_json_content).toBe(manualEditsContent)

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
