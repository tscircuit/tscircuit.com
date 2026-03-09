import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("delete package domain returns 403 for non-owner", async () => {
  const { axios, jane_axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/perm-delete-pkg",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const domain = db.addPackageDomain({
    points_to: "package",
    package_id: pkg.package_id,
    package_release_id: null,
    package_build_id: null,
    tag: null,
    default_main_component_path: null,
    fully_qualified_domain_name: "perm-delete-test.tscircuit.app",
  })

  try {
    await jane_axios.post("/api/package_domains/delete", {
      package_domain_id: domain.package_domain_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("forbidden")
  }

  const row = db.getPackageDomainById(domain.package_domain_id)
  expect(row).toBeDefined()
})
