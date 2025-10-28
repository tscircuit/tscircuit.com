import JSZip from "jszip"
import { Buffer } from "node:buffer"
import { randomUUID } from "node:crypto"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

const sampleBase64 = Buffer.from("binary-data").toString("base64")

test("download zip includes all bug report files", async () => {
  const { axios } = await getTestServer()

  const createResponse = await axios.post("/api/bug_reports/create", {
    text: "Initial report",
  })
  const bugReportId = createResponse.data.bug_report.bug_report_id

  await axios.post("/api/bug_reports/upload_file", {
    bug_report_id: bugReportId,
    file_path: "./src//issue.txt",
    content_text: "Steps to reproduce",
  })

  await axios.post("/api/bug_reports/upload_file", {
    bug_report_id: bugReportId,
    file_path: "attachments/data.bin",
    content_base64: sampleBase64,
  })

  const response = await axios.get("/api/bug_reports/download_zip", {
    params: { bug_report_id: bugReportId },
    responseType: "arrayBuffer",
  })

  expect(response.status).toBe(200)
  expect(response.headers.get("content-type")).toBe("application/zip")

  const zip = await JSZip.loadAsync(response.data)
  const textFile = await zip.file("src/issue.txt")?.async("string")
  const binaryFile = await zip.file("attachments/data.bin")?.async("string")

  expect(textFile).toBe("Steps to reproduce")
  expect(binaryFile).toBe("binary-data")
})

test("cannot download zip for other user's bug report", async () => {
  const { axios, jane_axios } = await getTestServer()

  const createResponse = await axios.post("/api/bug_reports/create", {
    text: "Owned by primary account",
  })
  const bugReportId = createResponse.data.bug_report.bug_report_id

  try {
    await jane_axios.get("/api/bug_reports/download_zip", {
      params: { bug_report_id: bugReportId },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("bug_report_forbidden")
  }
})

test("downloading unknown bug report returns 404", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/bug_reports/download_zip", {
      params: { bug_report_id: randomUUID() },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("bug_report_not_found")
  }
})
