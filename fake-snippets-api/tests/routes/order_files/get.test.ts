import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get order file", async () => {
  const {
    axios,
    seed: {
      order: { order_id },
    },
  } = await getTestServer()

  const file = new File(["test file content"], "test.txt", {
    type: "text/plain",
  })
  const formData = new FormData()
  formData.append("order_id", order_id)
  formData.append("file", file)
  formData.append("is_gerbers_zip", "false")

  const uploadResponse = await axios.post("/api/order_files/upload", formData)

  const orderFileId = uploadResponse.data.order_file.order_file_id

  const response = await axios.get("/api/order_files/get", {
    params: { order_file_id: orderFileId },
  })

  expect(response.status).toBe(200)
  expect(response.data.order_file).toBeDefined()
  expect(response.data.order_file.order_file_id).toBe(orderFileId)
  expect(response.data.order_file.order_id).toBe(order_id)
  expect(response.data.order_file.file_name).toBe("test.txt")
  expect(response.data.order_file.file_size).toBe(18)
  expect(response.data.order_file.is_gerbers_zip).toBe(false)
})

test("get non-existent order file", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/order_files/get", {
      params: { order_file_id: "non-existent-id" },
    })

    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Order file not found")
  }
})
