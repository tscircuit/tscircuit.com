import { test, expect } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("POST /packages/search should return private packages for owner and org members", async () => {
  const { jane_axios, seed, unauthenticatedAxios } = await getTestServer()

  const {
    data: { org },
  } = await jane_axios.post("/api/orgs/create", {
    tscircuit_handle: "private-search-org",
  })

  const { data: createData } = await jane_axios.post("/api/packages/create", {
    name: "private-search-org/secret-component",
    description: "A secret private component",
    is_private: true,
  })
  expect(createData.package.package_id).toBeTruthy()
  expect(createData.package.is_private).toBe(true)

  const publicSearchRes = await unauthenticatedAxios.post(
    "/api/packages/search",
    {
      query: "secret-component",
    },
  )
  expect(publicSearchRes.status).toBe(200)
  expect(publicSearchRes.data.packages.length).toBe(0)

  const ownerSearchRes = await jane_axios.post("/api/packages/search", {
    query: "secret-component",
  })
  expect(ownerSearchRes.status).toBe(200)
  expect(ownerSearchRes.data.packages.length).toBe(1)
  expect(ownerSearchRes.data.packages[0].unscoped_name).toBe("secret-component")
})
