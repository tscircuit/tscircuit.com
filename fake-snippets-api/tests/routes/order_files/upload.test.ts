import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("upload order file", async () => {
  const {
    axios,
    seed: {
      order: { order_id },
    },
  } = await getTestServer()

  const fileContent = "test file content"
  const fileContentBase64 = Buffer.from(fileContent).toString("base64")

  const response = await axios.post("/api/order_files/upload", {
    order_id,
    content_base64: fileContentBase64,
    is_gerbers_zip: false,
  })

  expect(response.status).toBe(200)
  expect(response.data.order_file).toBeDefined()
  expect(response.data.order_file.order_id).toBe(order_id)
  expect(response.data.order_file.file_content).toBeDefined()
  expect(response.data.order_file.content_type).toBe("base64")
  expect(response.data.order_file.is_gerbers_zip).toBe(false)
  expect(response.data.order_file.uploaded_at).toBeDefined()
})

test("upload order file with for_provider", async () => {
  const { axios, db } = await getTestServer()

  const orderResponse = await axios.post("/api/orders/create", {
    circuit_json: { test: "circuit data" },
  })

  const orderId = orderResponse.data.order.order_id

  const fileContent = "test file content for provider"
  const fileContentBase64 = Buffer.from(fileContent).toString("base64")

  const response = await axios.post("/api/order_files/upload", {
    order_id: orderId,
    content_base64: fileContentBase64,
    is_gerbers_zip: true,
    for_provider: "jlcpcb",
  })

  expect(response.status).toBe(200)
  expect(response.data.order_file).toBeDefined()
  expect(response.data.order_file.order_id).toBe(orderId)
  expect(response.data.order_file.file_content).toBeDefined()
  expect(response.data.order_file.content_type).toBe("base64")
  expect(response.data.order_file.is_gerbers_zip).toBe(true)
  expect(response.data.order_file.for_provider).toBe("jlcpcb")
  expect(response.data.order_file.uploaded_at).toBeDefined()
})

test("upload order file for non-existent order", async () => {
  const { axios } = await getTestServer()

  const fileContent = "test file content"
  const fileContentBase64 = Buffer.from(fileContent).toString("base64")

  try {
    await axios.post("/api/order_files/upload", {
      order_id: "non-existent-order-id",
      content_base64: fileContentBase64,
      is_gerbers_zip: false,
    })
    // If the request doesn't throw an error, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Order not found")
  }
})
