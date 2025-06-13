import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get datasheet", async () => {
  const { axios } = await getTestServer()
  const create = await axios.post("/api/datasheets/create", { chip_name: "Chip" })
  const id = create.data.datasheet.datasheet_id

  const res = await axios.get("/api/datasheets/get", { params: { datasheet_id: id } })

  expect(res.status).toBe(200)
  expect(res.data.datasheet.datasheet_id).toBe(id)
})
