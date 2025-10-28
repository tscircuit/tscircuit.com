import { Buffer } from "node:buffer"
import { randomUUID } from "node:crypto"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

const sampleBase64 = Buffer.from("binary-data").toString("base64")

test("upload text file to bug report", async () => {
  const { axios, db } = await getTestServer()

  const createResponse = await axios.post("/api/bug_reports/create", {
    text: "Initial report",
  })
  const bugReportId = createResponse.data.bug_report.bug_report_id

  const uploadResponse = await axios.post("/api/bug_reports/upload_file", {
    bug_report_id: bugReportId,
    file_path: "./src//issue.txt",
    content_text: "Steps to reproduce",
  })

  expect(uploadResponse.status).toBe(200)
  expect(uploadResponse.data.bug_report_file.file_path).toBe("src/issue.txt")
  expect(uploadResponse.data.bug_report_file.is_text).toBe(true)

  const storedReport = db.getBugReportById(bugReportId)
  expect(storedReport?.file_count).toBe(1)

  const storedFiles = db.getBugReportFilesByBugReportId(bugReportId)
  expect(storedFiles).toHaveLength(1)
  expect(storedFiles[0].content_text).toBe("Steps to reproduce")
})

test("upload binary file requires ownership", async () => {
  const { axios, jane_axios } = await getTestServer()

  const createResponse = await axios.post("/api/bug_reports/create", {
    text: "Owned by primary account",
  })
  const bugReportId = createResponse.data.bug_report.bug_report_id

  try {
    await jane_axios.post("/api/bug_reports/upload_file", {
      bug_report_id: bugReportId,
      file_path: "attachments/data.bin",
      content_base64: sampleBase64,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("bug_report_forbidden")
  }
})

test("cannot supply both text and base64 content", async () => {
  const { axios } = await getTestServer()

  const createResponse = await axios.post("/api/bug_reports/create", {
    text: "Initial",
  })
  const bugReportId = createResponse.data.bug_report.bug_report_id

  try {
    await axios.post("/api/bug_reports/upload_file", {
      bug_report_id: bugReportId,
      file_path: "details.txt",
      content_text: "foo",
      content_base64: sampleBase64,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
  }
})

test("uploading to unknown bug report returns 404", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/bug_reports/upload_file", {
      bug_report_id: randomUUID(),
      file_path: "missing.txt",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("bug_report_not_found")
  }
})
