import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

// Test listing datasheets by chip name

test("list datasheets", async () => {
  const { axios } = await getTestServer()

  await axios.post("/api/datasheets/create", { chip_name: "Chip" })
  await axios.post("/api/datasheets/create", { chip_name: "Chip" })
  await axios.post("/api/datasheets/create", { chip_name: "Other" })

  const res = await axios.get("/api/datasheets/list", {
    params: { chip_name: "Chip" },
  })

  expect(res.status).toBe(200)
  expect(res.data.datasheets).toHaveLength(2)
  expect(res.data.datasheets.every((d: any) => d.chip_name === "Chip")).toBe(
    true,
  )
})

test("list datasheets is_popular returns all", async () => {
  const { axios } = await getTestServer()

  await axios.post("/api/datasheets/create", { chip_name: "Chip" })
  await axios.post("/api/datasheets/create", { chip_name: "Other" })

  const res = await axios.get("/api/datasheets/list", {
    params: { is_popular: true },
  })

  expect(res.status).toBe(200)
  expect(res.data.datasheets).toHaveLength(2)
})

test("list datasheets empty", async () => {
  const { axios } = await getTestServer()

  await axios.post("/api/datasheets/create", { chip_name: "Other" })

  const res = await axios.get("/api/datasheets/list", {
    params: { chip_name: "Chip" },
  })

  expect(res.status).toBe(200)
  expect(res.data.datasheets).toHaveLength(0)
})
