import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("get autorouting bug report by id", async () => {
  const { axios, db } = await getTestServer()

  // Create a test bug report
  const timestamp = new Date().toISOString()
  const testAccountId = "account-1234" // This matches the hardcoded auth in withSessionAuth middleware

  // Add test bug report directly to the database
  const report = db.addAutoroutingBugReport({
    account_id: testAccountId,
    failed_to_route: true,
    circuit_json: [{ type: "pcb", width: 100, height: 100 }],
    simple_route_json: null,
    created_at: timestamp,
    description: "Test bug report for get endpoint",
    status: "open",
  })

  // Test getting the bug report by id
  const response = await axios.get(`/api/autorouting/bug_report/get?bug_report_id=${report.bug_report_id}`)
  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.bug_report).toBeDefined()
  expect(response.data.bug_report.bug_report_id).toBe(report.bug_report_id)
  expect(response.data.bug_report.account_id).toBe(testAccountId)
  expect(response.data.bug_report.failed_to_route).toBe(true)
  expect(response.data.bug_report.description).toBe("Test bug report for get endpoint")
  expect(response.data.bug_report.status).toBe("open")

  // Test with non-existent id
  try {
    await axios.get("/api/autorouting/bug_report/get?bug_report_id=non-existent-id")
    expect("this should not be reached").toBe("axios should have thrown")
  } catch (error) {
    // @ts-ignore
    expect(error.response.status).toBe(404)
    // @ts-ignore
    expect(error.response.data.error.error_code).toBe("bug_report_not_found")
  }
})