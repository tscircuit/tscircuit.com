import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"

test("GET /api/snippets/get - should return snippet by snippet_id", async () => {
  const { axios } = await getTestServer()

  // First create a snippet
  const newSnippetData = {
    code: "console.log('Hello World')",
    snippet_type: "package",
    description: "A test snippet",
    compiled_js: "console.log('Hello World')",
    dts: "export function hello(): void;",
  }

  const createResponse = await axios.post(
    "/api/snippets/create",
    newSnippetData,
  )
  expect(createResponse.status).toBe(200)
  const createdSnippet = createResponse.data.snippet

  // Get the created snippet using the /get endpoint
  const getResponse = await axios.get("/api/snippets/get", {
    params: { snippet_id: createdSnippet.snippet_id },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.snippet).toEqual(snippetSchema.parse(createdSnippet))
})

test("GET /api/snippets/get - should return 404 if snippet not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/snippets/get", {
      params: { snippet_id: "non_existent_snippet_id" },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("snippet_not_found")
    expect(error.data.error.message).toBe(
      'Snippet not found (searched using {"snippet_id":"non_existent_snippet_id"})',
    )
  }
})

test("GET /api/snippets/get - should return snippet by name and owner", async () => {
  const { axios } = await getTestServer()

  // First create a snippet
  const newSnippetData = {
    code: "console.log('Hello World')",
    snippet_type: "package",
    description: "A test snippet",
    compiled_js: "console.log('Hello World')",
    dts: "export function hello(): void;",
  }

  const createResponse = await axios.post(
    "/api/snippets/create",
    newSnippetData,
  )
  expect(createResponse.status).toBe(200)
  const createdSnippet = createResponse.data.snippet

  // Get the snippet using name and owner
  const getResponse = await axios.get("/api/snippets/get", {
    params: {
      name: createdSnippet.name,
      owner_name: createdSnippet.owner_name,
    },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.snippet).toEqual(snippetSchema.parse(createdSnippet))
})
