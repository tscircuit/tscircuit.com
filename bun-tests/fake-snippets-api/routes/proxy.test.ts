import { test, expect } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("should require X-Target-Url header", async () => {
  const { axios } = await getTestServer()
  try {
    await axios.get("/proxy")
    throw new Error("Should not reach here")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error).toBe("X-Target-Url header is required")
  }
})

test("should prevent recursive proxy calls when X-proxied header is present", async () => {
  const { jane_axios: axios } = await getTestServer()
  const port = axios.defaults?.baseURL?.split(":")[2]

  try {
    await axios.get("/proxy", {
      headers: {
        "X-Target-Url": `http://localhost:${port}/proxy`,
      },
    })
    throw new Error("Should not reach here")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error).toBe("Recursive proxy calls are not allowed")
  }
})

test("should reject unauthenticated requests to /proxy", async () => {
  const { axios } = await getTestServer()
  try {
    await axios.get("/proxy", {
      headers: {
        "X-Target-Url": axios.defaults.baseURL + "/health",
      },
    })
    throw new Error("Should not reach here")
  } catch (error: any) {
    expect(error.status).toBe(401)
  }
})

test("should successfully proxy requests to allowed domains", async () => {
  const { jane_axios: axios } = await getTestServer()
  const port = axios.defaults?.baseURL?.split(":")[2]
  const response = await axios.get("/proxy", {
    headers: {
      "X-Target-Url": `http://localhost:${port}/health`,
    },
  })

  expect(response.status).toBe(200)
})
