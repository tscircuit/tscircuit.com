import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("POST /api/package_domains/update - successfully updates domain", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/domain-update-test",
    description: "Test package",
  })

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: packageRes.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })

  const packageBuild = db.addPackageBuild({
    package_release_id: releaseRes.data.package_release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date().toISOString(),
    transpilation_completed_at: new Date().toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date().toISOString(),
    circuit_json_build_completed_at: new Date().toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date().toISOString(),
    build_completed_at: new Date().toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    build_logs: null,
    package_build_website_url: null,
  })

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package_build",
    package_build_id: packageBuild.package_build_id,
    fully_qualified_domain_name: "update-test.tscircuit.app",
  })

  const package_domain_id = createRes.data.package_domain.package_domain_id

  const res = await axios.post("/api/package_domains/update", {
    package_domain_id,
    default_main_component_path: "/src/updated.tsx",
    fully_qualified_domain_name: "updated-test.tscircuit.app",
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.default_main_component_path).toBe(
    "/src/updated.tsx",
  )
  expect(res.data.package_domain.fully_qualified_domain_name).toBe(
    "updated-test.tscircuit.app",
  )
})

test("POST /api/package_domains/update - returns 404 for non-existent domain", async () => {
  const { axios } = await getTestServer()

  const res = await axios.post(
    "/api/package_domains/update",
    {
      package_domain_id: "non-existent-id",
      default_main_component_path: "/src/test.tsx",
    },
    { validateStatus: () => true },
  )

  expect(res.status).toBe(404)
  expect(res.data.error.error_code).toBe("package_domain_not_found")
})

test("POST /api/package_domains/update - returns 400 for duplicate FQDN", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/domain-update-fqdn-test",
    description: "Test package",
  })

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: packageRes.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })

  const packageBuild = db.addPackageBuild({
    package_release_id: releaseRes.data.package_release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date().toISOString(),
    transpilation_completed_at: new Date().toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date().toISOString(),
    circuit_json_build_completed_at: new Date().toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date().toISOString(),
    build_completed_at: new Date().toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    build_logs: null,
    package_build_website_url: null,
  })

  await axios.post("/api/package_domains/create", {
    points_to: "package_build",
    package_build_id: packageBuild.package_build_id,
    fully_qualified_domain_name: "existing-fqdn.tscircuit.app",
  })

  const createRes2 = await axios.post("/api/package_domains/create", {
    points_to: "package_build",
    package_build_id: packageBuild.package_build_id,
    fully_qualified_domain_name: "another-fqdn.tscircuit.app",
  })

  const res = await axios.post(
    "/api/package_domains/update",
    {
      package_domain_id: createRes2.data.package_domain.package_domain_id,
      fully_qualified_domain_name: "existing-fqdn.tscircuit.app",
    },
    { validateStatus: () => true },
  )

  expect(res.status).toBe(400)
  expect(res.data.error.error_code).toBe("domain_fqdn_exists")
})

test("POST /api/package_domains/update - returns existing domain when no updates provided", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/domain-no-update-test",
    description: "Test package",
  })

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: packageRes.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })

  const packageBuild = db.addPackageBuild({
    package_release_id: releaseRes.data.package_release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date().toISOString(),
    transpilation_completed_at: new Date().toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date().toISOString(),
    circuit_json_build_completed_at: new Date().toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date().toISOString(),
    build_completed_at: new Date().toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    build_logs: null,
    package_build_website_url: null,
  })

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package_build",
    package_build_id: packageBuild.package_build_id,
    fully_qualified_domain_name: "no-update-test.tscircuit.app",
  })

  const package_domain_id = createRes.data.package_domain.package_domain_id

  const res = await axios.post("/api/package_domains/update", {
    package_domain_id,
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.package_domain_id).toBe(package_domain_id)
  expect(res.data.package_domain.fully_qualified_domain_name).toBe(
    "no-update-test.tscircuit.app",
  )
})

test("POST /api/package_domains/update - can set fields to null", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/domain-null-test",
    description: "Test package",
  })

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: packageRes.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })

  const packageBuild = db.addPackageBuild({
    package_release_id: releaseRes.data.package_release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date().toISOString(),
    transpilation_completed_at: new Date().toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date().toISOString(),
    circuit_json_build_completed_at: new Date().toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date().toISOString(),
    build_completed_at: new Date().toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    build_logs: null,
    package_build_website_url: null,
  })

  const createRes = await axios.post("/api/package_domains/create", {
    points_to: "package_build",
    package_build_id: packageBuild.package_build_id,
    default_main_component_path: "/src/index.tsx",
    fully_qualified_domain_name: "null-test.tscircuit.app",
  })

  const package_domain_id = createRes.data.package_domain.package_domain_id

  const res = await axios.post("/api/package_domains/update", {
    package_domain_id,
    default_main_component_path: null,
    fully_qualified_domain_name: null,
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.default_main_component_path).toBeNull()
  expect(res.data.package_domain.fully_qualified_domain_name).toBeNull()
})
