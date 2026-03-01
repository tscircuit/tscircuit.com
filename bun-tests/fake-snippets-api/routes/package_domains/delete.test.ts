import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("delete package domain", async () => {
  const { axios, db } = await getTestServer()

  const domain = db.addPackageDomain({
    points_to: "package",
    package_id: "pkg-123",
    package_release_id: null,
    package_build_id: null,
    tag: null,
    default_main_component_path: null,
    fully_qualified_domain_name: "delete-me.example.com",
  })

  const deleteRes = await axios.post("/api/package_domains/delete", {
    package_domain_id: domain.package_domain_id,
  })

  expect(deleteRes.status).toBe(200)
  expect(deleteRes.data.ok).toBe(true)

  try {
    await axios.post("/api/package_domains/get", {
      package_domain_id: domain.package_domain_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
  }
})

test("delete package domain - forbidden for non-owner", async () => {
  const { axios, jane_axios, db, seed } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/perm-check-pkg",
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
    fully_qualified_domain_name: "perm-check.example.com",
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

  const getRes = await axios.post("/api/package_domains/get", {
    package_domain_id: domain.package_domain_id,
  })
  expect(getRes.status).toBe(200)
})

test("delete package domain - not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/delete", {
      package_domain_id: "non-existent-id",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_domain_not_found")
  }
})
