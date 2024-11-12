import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

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
