import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("update package domain - update fully_qualified_domain_name", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-update-domain",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "old-domain.example.com",
  })
  const created = createRes.data.package_domain

  const updateRes = await axios.post("/api/package_domains/update", {
    package_domain_id: created.package_domain_id,
    fully_qualified_domain_name: "new-domain.example.com",
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)
  expect(updateRes.data.package_domain.fully_qualified_domain_name).toBe(
    "new-domain.example.com",
  )
  expect(updateRes.data.package_domain.package_domain_id).toBe(
    created.package_domain_id,
  )
  // Other fields should remain unchanged
  expect(updateRes.data.package_domain.points_to).toBe("package")
  expect(updateRes.data.package_domain.package_id).toBe(pkg.package_id)
})

test("update package domain - update default_main_component_path", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-update-path",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
  })
  const created = createRes.data.package_domain

  const updateRes = await axios.post("/api/package_domains/update", {
    package_domain_id: created.package_domain_id,
    default_main_component_path: "/src/MyComponent.tsx",
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)
  expect(updateRes.data.package_domain.default_main_component_path).toBe(
    "/src/MyComponent.tsx",
  )
})

test("update package domain - clear field with null", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-update-null",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "clear-me.example.com",
    default_main_component_path: "/src/Main.tsx",
  })
  const created = createRes.data.package_domain

  const updateRes = await axios.post("/api/package_domains/update", {
    package_domain_id: created.package_domain_id,
    default_main_component_path: null,
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)
  expect(updateRes.data.package_domain.default_main_component_path).toBeNull()
})

test("update package domain - no fields returns existing domain unchanged", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-update-noop",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "noop.example.com",
  })
  const created = createRes.data.package_domain

  const updateRes = await axios.post("/api/package_domains/update", {
    package_domain_id: created.package_domain_id,
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)
  expect(updateRes.data.package_domain).toEqual(created)
})

test("update package domain - not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_domains/update", {
      package_domain_id: "non-existent-id",
      fully_qualified_domain_name: "test.example.com",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_domain_not_found")
  }
})

test("update package domain - duplicate FQDN", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-update-dup",
    description: "Test",
  })
  const pkg = packageRes.data.package

  await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "taken-domain.example.com",
  })

  const createRes2 = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "other-domain.example.com",
  })
  const domain2 = createRes2.data.package_domain

  try {
    await axios.post("/api/package_domains/update", {
      package_domain_id: domain2.package_domain_id,
      fully_qualified_domain_name: "taken-domain.example.com",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("domain_fqdn_exists")
  }
})
