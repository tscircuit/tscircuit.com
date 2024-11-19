import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("download snippet files and directory listing", async () => {
  const { axios, db } = await getTestServer()

  // Add a test snippet
  const snippet = {
    unscoped_name: "test-package",
    owner_name: "testuser",
    code: "export const TestComponent = () => <div>Test</div>",
    dts: "export declare const TestComponent: () => JSX.Element",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "testuser/test-package",
    snippet_type: "package",
    description: "Test package",
  }
  db.addSnippet(snippet as any)

  // Test downloading index.ts
  const indexResponse = await axios.get("/api/snippets/download", {
    params: { jsdelivr_path: "testuser/test-package@1.0.0/index.ts" },
  })
  expect(indexResponse.status).toBe(200)
  expect(indexResponse.data).toBe(snippet.code)

  // Test downloading index.d.ts
  const dtsResponse = await axios.get("/api/snippets/download", {
    params: { jsdelivr_path: "testuser/test-package@1.0.0/index.d.ts" },
  })
  expect(dtsResponse.status).toBe(200)
  expect(dtsResponse.data).toBe(snippet.dts)

  // Test downloading package.json
  const packageJsonResponse = await axios.get("/api/snippets/download", {
    params: { jsdelivr_path: "testuser/test-package@1.0.0/package.json" },
  })
  expect(packageJsonResponse.status).toBe(200)
  const packageJson = packageJsonResponse.data
  expect(packageJson).toEqual({
    name: "@tsci/testuser.test-package",
    version: "1.0.0",
    main: "index.ts",
    types: "index.d.ts",
  })

  // Test downloading root (directory listing)
  const rootResponse = await axios.get("/api/snippets/download", {
    params: { jsdelivr_path: "testuser/test-package@1.0.0" },
  })
  expect(rootResponse.status).toBe(200)
  const rootData = rootResponse.data
  expect(rootData.tags).toBeDefined()
  expect(rootData.versions).toBeDefined()

  // Test downloading flat directory listing
  const flatResponse = await axios.get("/api/snippets/download", {
    params: { jsdelivr_path: "testuser/test-package@1.0.0/flat" },
  })
  expect(flatResponse.status).toBe(200)
  const flatData = flatResponse.data
  expect(flatData.default).toBe("/index.ts")
  expect(flatData.files).toHaveLength(4)
  expect(flatData.files[0].name).toMatch(/^\//)

  // Test downloading non-existent file
  try {
    await axios.get("/api/snippets/download", {
      params: { jsdelivr_path: "testuser/test-package@1.0.0/non-existent.ts" },
    })
    // If the request doesn't throw an error, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Requested file not found")
  }

  // Test downloading non-existent package
  try {
    await axios.get("/api/snippets/download", {
      params: { jsdelivr_path: "testuser/non-existent-package@1.0.0/index.ts" },
    })
    // If the request doesn't throw an error, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Snippet not found")
  }
})
