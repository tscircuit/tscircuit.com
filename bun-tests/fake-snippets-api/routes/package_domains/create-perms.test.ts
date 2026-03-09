import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("create package domain returns 403 for non-owner", async () => {
  const { axios, jane_axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/perm-create-pkg",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseRes.data.package_release

  const build = db.addPackageBuild({
    package_release_id: release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_logs: [],
    circuit_json_build_logs: [],
    build_error_last_updated_at: new Date().toISOString(),
  })

  try {
    await jane_axios.post("/api/package_domains/create", {
      points_to: "package_build",
      package_build_id: build.package_build_id,
      fully_qualified_domain_name: "perm-create-test.tscircuit.app",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("forbidden")
  }
})
