import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("run async tasks processes datasheets", async () => {
  const { axios } = await getTestServer()
  const create = await axios.post("/api/datasheets/create", {
    chip_name: "Chip",
  })
  const id = create.data.datasheet.datasheet_id

  const runRes = await axios.get("/api/_fake/run_async_tasks")
  expect(runRes.status).toBe(200)

  const res = await axios.get("/api/datasheets/get", {
    params: { datasheet_id: id },
  })
  expect(res.data.datasheet.pin_information).not.toBeNull()
})
