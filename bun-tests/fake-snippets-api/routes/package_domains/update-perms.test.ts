import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("update package domain returns 403 for non-owner", async () => {
  const { axios, jane_axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/perm-update-pkg",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "perm-update-test.tscircuit.app",
  })
  const domain = createRes.data.package_domain

  try {
    await jane_axios.post("/api/package_domains/update", {
      package_domain_id: domain.package_domain_id,
      default_main_component_path: "/src/hacked.tsx",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("forbidden")
  }
})
