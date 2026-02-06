import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("get package domain by package_domain_id", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-get-domain",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "get-test.example.com",
  })
  const created = createRes.data.package_domain

  const getRes = await axios.post("/api/package_domains/get", {
    package_domain_id: created.package_domain_id,
  })

  expect(getRes.status).toBe(200)
  expect(getRes.data.ok).toBe(true)
  expect(getRes.data.package_domain).toEqual(created)
})

test("get package domain by fully_qualified_domain_name", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-get-fqdn",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "fqdn-test.example.com",
  })
  const created = createRes.data.package_domain

  const getRes = await axios.post("/api/package_domains/get", {
    fully_qualified_domain_name: "fqdn-test.example.com",
  })

  expect(getRes.status).toBe(200)
  expect(getRes.data.ok).toBe(true)
  expect(getRes.data.package_domain).toEqual(created)
})

test("get package domain - missing parameter", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/get", {})
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("missing_parameter")
  }
})

test("get package domain - not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/get", {
      package_domain_id: "non-existent-id",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_domain_not_found")
  }
})

test("get package domain - not found by FQDN", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/get", {
      fully_qualified_domain_name: "does-not-exist.example.com",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_domain_not_found")
  }
})
