import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get order file", async () => {
  const {
    axios,
    seed: {
      order: { order_id },
    },
  } = await getTestServer()

  const fileContent = "test file content"
  const fileContentBase64 = Buffer.from(fileContent).toString("base64")

  const uploadResponse = await axios.post("/api/order_files/upload", {
    order_id,
    content_base64: fileContentBase64,
    is_gerbers_zip: false,
  })

  const orderFileId = uploadResponse.data.order_file.order_file_id

  const response = await axios.get("/api/order_files/get", {
    params: { order_file_id: orderFileId },
  })

  expect(response.status).toBe(200)
  expect(response.data.order_file).toBeDefined()
  expect(response.data.order_file.order_file_id).toBe(orderFileId)
  expect(response.data.order_file.order_id).toBe(order_id)
  expect(response.data.order_file.content_type).toBe("base64")
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
