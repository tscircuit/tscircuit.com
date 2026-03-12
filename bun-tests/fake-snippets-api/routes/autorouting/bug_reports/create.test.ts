import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("create autorouting bug report", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/autorouting/bug_reports/create", {
    title: "short on top layer",
    description: "Trace overlaps near U2",
    circuit_json: [{ type: "source_component", name: "U2" }],
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.autorouting_bug_report).toMatchObject({
    title: "short on top layer",
    description: "Trace overlaps near U2",
  })
  expect(
    response.data.autorouting_bug_report.autorouting_bug_report_id,
  ).toBeString()
})
