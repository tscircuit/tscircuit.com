import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("process datasheets", async () => {
  const { axios } = await getTestServer()
  const create = await axios.post("/api/datasheets/create", {
    chip_name: "Chip",
  })
  const id = create.data.datasheet.datasheet_id

  const processRes = await axios.post(
    "/api/_fake/datasheets/process_all_datasheets",
  )
  expect(processRes.status).toBe(200)

  const res = await axios.get("/api/datasheets/get", {
    params: { datasheet_id: id },
  })
  expect(res.data.datasheet.pin_information).not.toBeNull()
  expect(res.data.datasheet.datasheet_pdf_urls).not.toBeNull()
})
