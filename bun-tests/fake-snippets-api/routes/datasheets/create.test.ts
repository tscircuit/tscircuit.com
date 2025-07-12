import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("create datasheet", async () => {
  const { axios } = await getTestServer()

  const res = await axios.post("/api/datasheets/create", {
    chip_name: "TestChip",
  })

  expect(res.status).toBe(200)
  expect(res.data.datasheet.chip_name).toBe("TestChip")
  expect(res.data.datasheet.pin_information).toBeNull()
  expect(res.data.datasheet.datasheet_pdf_urls).toBeNull()
  expect(res.data.datasheet.ai_description).toBeNull()
})
