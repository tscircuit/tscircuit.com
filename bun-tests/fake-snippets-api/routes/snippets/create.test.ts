import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("create snippet", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post(
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

  expect(response.status).toBe(200)
  expect(response.data.snippet.unscoped_name).toBe("TestSnippet")
  expect(response.data.snippet.owner_name).toBe("testuser")
  expect(response.data.snippet.code).toBe("Test Content")
  expect(response.data.snippet.snippet_type).toBe("package")
  expect(response.data.snippet.description).toBe("Test Description")
})

test("create snippet and call package get to verify it exists", async () => {
  const { axios, db } = await getTestServer()

  const response = await axios.post("/api/snippets/create", {
    unscoped_name: "example-package",
    code: "console.log('Hello, world!');",
    snippet_type: "package",
    description: "Test Description",
  })
  const packageResponse = await axios.get(`/api/packages/get`, {
    params: {
      package_id: response.data.snippet.snippet_id,
    },
  })
  expect(packageResponse.status).toBe(200)
  expect(packageResponse.data.package.unscoped_name).toBe("example-package")
  expect(packageResponse.data.package.owner_github_username).toBe("testuser")
  expect(packageResponse.data.package.description).toBe("Test Description")

  // Add package file verification
  const packageFileResponse = await axios.post(`/api/package_files/get`, {
    package_release_id: packageResponse.data.package.latest_package_release_id,
    file_path: "index.tsx",
  })

  expect(packageFileResponse.status).toBe(200)
  expect(packageFileResponse.data.ok).toBe(true)
  expect(packageFileResponse.data.package_file).toBeDefined()
  expect(packageFileResponse.data.package_file.content_text).toBe(
    "console.log('Hello, world!');",
  )
})
