import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("update snippet updates the correct files and does not corrupt the db", async () => {
  const { axios } = await getTestServer()

  // 1. Create first snippet
  const createRes1 = await axios.post("/api/snippets/create", {
    unscoped_name: "snippet-one",
    code: "console.log('first snippet')",
    snippet_type: "board",
  })
  expect(createRes1.status).toBe(200)
  const snippet1 = createRes1.data.snippet

  // 2. Create second snippet
  const createRes2 = await axios.post("/api/snippets/create", {
    unscoped_name: "snippet-two",
    code: "console.log('second snippet')",
    snippet_type: "board",
  })
  expect(createRes2.status).toBe(200)
  const snippet2 = createRes2.data.snippet

  // 3. Update the second snippet
  const updateRes = await axios.post("/api/snippets/update", {
    snippet_id: snippet2.snippet_id,
    code: "console.log('updated second snippet')",
  })
  expect(updateRes.status).toBe(200)
  expect(updateRes.data.snippet.code).toBe(
    "console.log('updated second snippet')",
  )

  // 4. Retrieve both snippets and verify correctness
  const getRes1 = await axios.get("/api/snippets/get", {
    params: { snippet_id: snippet1.snippet_id },
  })
  expect(getRes1.status).toBe(200)
  expect(getRes1.data.snippet.code).toBe("console.log('first snippet')")

  const getRes2 = await axios.get("/api/snippets/get", {
    params: { snippet_id: snippet2.snippet_id },
  })
  expect(getRes2.status).toBe(200)
  expect(getRes2.data.snippet.code).toBe(
    "console.log('updated second snippet')",
  )
})
