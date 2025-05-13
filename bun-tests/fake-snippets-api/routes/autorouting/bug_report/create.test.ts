import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("create autorouting bug report with circuit_json", async () => {
  const { axios } = await getTestServer()

  const mockCircuitJson = [{ type: "pcb", width: 100, height: 100 }]
  
  const response = await axios.post("/api/autorouting/bug_report/create", {
    failed_to_route: true,
    circuit_json: mockCircuitJson,
    description: "Test bug report with circuit_json",
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.bug_report).toBeDefined()
  expect(response.data.bug_report.failed_to_route).toBe(true)
  expect(response.data.bug_report.circuit_json).toEqual(mockCircuitJson)
  expect(response.data.bug_report.simple_route_json).toBeNull()
  expect(response.data.bug_report.description).toBe("Test bug report with circuit_json")
  expect(response.data.bug_report.status).toBe("open")
})

test("create autorouting bug report with simple_route_json", async () => {
  const { axios } = await getTestServer()

  const mockSimpleRouteJson = { nodes: [], edges: [] }
  
  const response = await axios.post("/api/autorouting/bug_report/create", {
    failed_to_route: false,
    simple_route_json: mockSimpleRouteJson,
    description: "Test bug report with simple_route_json",
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.bug_report).toBeDefined()
  expect(response.data.bug_report.failed_to_route).toBe(false)
  expect(response.data.bug_report.circuit_json).toBeNull()
  expect(response.data.bug_report.simple_route_json).toEqual(mockSimpleRouteJson)
  expect(response.data.bug_report.description).toBe("Test bug report with simple_route_json")
  expect(response.data.bug_report.status).toBe("open")
})

test("fail to create autorouting bug report without circuit_json or simple_route_json", async () => {
  const { axios } = await getTestServer()
  
  try {
    await axios.post("/api/autorouting/bug_report/create", {
      failed_to_route: true,
      description: "Test invalid bug report",
    })
    expect("this should not be reached").toBe("axios should have thrown")
  } catch (error) {
    // @ts-ignore
    expect(error.response.status).toBe(400)
    // @ts-ignore
    expect(error.response.data.error.error_code).toBe("invalid_request")
  }
})