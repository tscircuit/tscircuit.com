import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("create bug report with defaults", async () => {
  const { axios, db, seed } = await getTestServer()

  const response = await axios.post("/api/bug_reports/create", {})

  expect(response.status).toBe(200)
  const bugReport = response.data.bug_report
  expect(bugReport).toBeDefined()
  expect(bugReport.reporter_account_id).toBe(seed.account.account_id)
  expect(bugReport.text).toBeNull()
  expect(bugReport.is_auto_deleted).toBe(false)
  expect(bugReport.delete_at).toBeNull()
  expect(bugReport.file_count).toBe(0)

  const stored = db.getBugReportById(bugReport.bug_report_id)
  expect(stored).toBeDefined()
  expect(stored?.bug_report_id).toBe(bugReport.bug_report_id)
})

test("requires delete_at when auto deletion is enabled", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/bug_reports/create", {
      is_auto_deleted: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.message).toContain(
      "delete_at is required when is_auto_deleted is true",
    )
  }
})
