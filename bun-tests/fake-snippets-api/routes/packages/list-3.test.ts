import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("list should filter by owner_tscircuit_handle", async () => {
  const { jane_axios } = await getTestServer()

  await jane_axios.post("/api/packages/create", {
    name: "jane/handle-test",
  })

  const {
    data: { packages },
  } = await jane_axios.post("/api/packages/list", {
    owner_tscircuit_handle: "jane",
  })

  expect(packages.length).toBeGreaterThan(0)
  expect(packages.find((p: any) => p.name === "jane/handle-test")).toBeDefined()
})
