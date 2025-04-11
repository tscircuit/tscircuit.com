import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("add star to snippet", async () => {
  const { axios } = await getTestServer()

  // Create a test snippet using the create endpoint
  const newSnippetData = {
    code: "Test Content",
    snippet_type: "package",
    description: "Test Description",
  }
  const createResponse = await axios.post(
    "/api/snippets/create",
    newSnippetData,
  )
  expect(createResponse.status).toBe(200)
  const createdSnippet = createResponse.data.snippet

  // Star the snippet
  const response = await axios.post("/api/snippets/add_star", {
    snippet_id: createdSnippet.snippet_id,
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify star was added by checking the snippet again
  const getResponse = await axios.get("/api/snippets/get", {
    params: { snippet_id: createdSnippet.snippet_id },
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.snippet.is_starred).toBe(true)
})

test("add star to non-existent snippet", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/snippets/add_star", {
      snippet_id: "non-existent-id",
    })
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Snippet not found")
  }
})

test("add star to already starred snippet", async () => {
  const { axios } = await getTestServer()

  // Create a test snippet using the create endpoint
  const newSnippetData = {
    code: "Test Content",
    snippet_type: "package",
    description: "Test Description",
  }
  const createResponse = await axios.post(
    "/api/snippets/create",
    newSnippetData,
  )
  expect(createResponse.status).toBe(200)
  const createdSnippet = createResponse.data.snippet

  // Star the snippet first time
  await axios.post("/api/snippets/add_star", {
    snippet_id: createdSnippet.snippet_id,
  })

  // Try to star again
  try {
    await axios.post("/api/snippets/add_star", {
      snippet_id: createdSnippet.snippet_id,
    })
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.message).toBe(
      "You have already starred this snippet",
    )
  }
})
