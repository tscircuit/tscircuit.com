import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("get datasheet", async () => {
  const { axios } = await getTestServer()
  const create = await axios.post("/api/datasheets/create", {
    chip_name: "Chip",
  })
  const id = create.data.datasheet.datasheet_id

  const res = await axios.get("/api/datasheets/get", {
    params: { datasheet_id: id },
  })

  expect(res.status).toBe(200)
  expect(res.data.datasheet.datasheet_id).toBe(id)
})

test("get datasheet by chip name", async () => {
  const { axios } = await getTestServer()
  const create = await axios.post("/api/datasheets/create", {
    chip_name: "Chip1",
  })

  const res = await axios.get("/api/datasheets/get", {
    params: { chip_name: "Chip1" },
  })

  expect(res.status).toBe(200)
  expect(res.data.datasheet.datasheet_id).toBe(
    create.data.datasheet.datasheet_id,
  )
})

test("get datasheet by chip name 404", async () => {
  const { axios } = await getTestServer()
  const res = await axios.get("/api/datasheets/get", {
    params: { chip_name: "Missing" },
    validateStatus: () => true,
  })
  expect(res.status).toBe(404)
})

test("get datasheet by chip name case insensitive", async () => {
  const { axios } = await getTestServer()
  await axios.post("/api/datasheets/create", { chip_name: "ChipCase" })

  const res = await axios.get("/api/datasheets/get", {
    params: { chip_name: "chipcase" },
  })

  expect(res.status).toBe(200)
  expect(res.data.datasheet.chip_name).toBe("ChipCase")
})
