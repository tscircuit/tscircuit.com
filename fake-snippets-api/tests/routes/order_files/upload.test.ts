import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("upload order file", async () => {
  const { axios, db } = await getTestServer()

  // First, create an order
  const orderResponse = await axios.post("/api/orders/create", {
    circuit_json: { test: "circuit data" },
  })

  const orderId = orderResponse.data.order.order_id

  // Now, upload a file for this order
  const file = new File(["test file content"], "test.txt", {
    type: "text/plain",
  })
  const formData = new FormData()
  formData.append("order_id", orderId)
  formData.append("file", file)
  formData.append("is_gerbers_zip", "false")

  const response = await axios.post("/api/order_files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  expect(response.status).toBe(200)
  expect(response.data.order_file).toBeDefined()
  expect(response.data.order_file.order_id).toBe(orderId)
  expect(response.data.order_file.file_name).toBe("test.txt")
  expect(response.data.order_file.file_size).toBe(18) // "test file content".length
  expect(response.data.order_file.is_gerbers_zip).toBe(false)
})
