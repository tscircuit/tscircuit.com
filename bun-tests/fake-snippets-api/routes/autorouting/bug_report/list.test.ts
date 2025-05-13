import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("list autorouting bug reports", async () => {
  const { axios, db } = await getTestServer()

  // Create some test bug reports
  const timestamp = new Date().toISOString()
  const testAccountId = "account-1234" // This matches the hardcoded auth in withSessionAuth middleware

  // Add test bug reports directly to the database
  const report1 = db.addAutoroutingBugReport({
    account_id: testAccountId,
    failed_to_route: true,
    circuit_json: [{ type: "pcb", width: 100, height: 100 }],
    simple_route_json: null,
    created_at: timestamp,
    description: "Test bug report 1",
    status: "open",
  })

  const report2 = db.addAutoroutingBugReport({
    account_id: testAccountId,
    failed_to_route: false,
    circuit_json: null,
    simple_route_json: { nodes: [], edges: [] },
    created_at: timestamp,
    description: "Test bug report 2",
    status: "in_progress",
  })

  // Test listing all bug reports
  const response = await axios.get("/api/autorouting/bug_report/list")
  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.bug_reports).toBeDefined()
  expect(response.data.bug_reports.length).toBeGreaterThanOrEqual(2)
  
  // Test filtering by status
  const openResponse = await axios.get("/api/autorouting/bug_report/list?status=open")
  expect(openResponse.status).toBe(200)
  expect(openResponse.data.bug_reports.some(r => r.bug_report_id === report1.bug_report_id)).toBe(true)
  expect(openResponse.data.bug_reports.every(r => r.status === "open")).toBe(true)
  
  // Test filtering by failed_to_route
  const failedResponse = await axios.get("/api/autorouting/bug_report/list?failed_to_route=true")
  expect(failedResponse.status).toBe(200)
  expect(failedResponse.data.bug_reports.some(r => r.bug_report_id === report1.bug_report_id)).toBe(true)
  expect(failedResponse.data.bug_reports.every(r => r.failed_to_route === true)).toBe(true)
  
  // Test filtering by account_id
  const accountResponse = await axios.get(`/api/autorouting/bug_report/list?account_id=${testAccountId}`)
  expect(accountResponse.status).toBe(200)
  expect(accountResponse.data.bug_reports.some(r => r.bug_report_id === report1.bug_report_id)).toBe(true)
  expect(accountResponse.data.bug_reports.some(r => r.bug_report_id === report2.bug_report_id)).toBe(true)
})