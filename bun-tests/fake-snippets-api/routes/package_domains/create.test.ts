import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("POST /api/package_domains/create - successfully creates domain with package_build", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/domain-test",
    description: "Test package for domains",
  })
  expect(packageRes.status).toBe(200)

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: packageRes.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  expect(releaseRes.status).toBe(200)

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
    package_build_website_url: "https://preview.tscircuit.com/pb_test",
  })

  const res = await axios.post("/api/package_domains/create", {
    points_to: "package_build",
    package_build_id: packageBuild.package_build_id,
    default_main_component_path: "/src/index.tsx",
    fully_qualified_domain_name: "domain-test.tscircuit.app",
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.package_build_id).toBe(
    packageBuild.package_build_id,
  )
  expect(res.data.package_domain.points_to).toBe("package_build")
  expect(res.data.package_domain.default_main_component_path).toBe(
    "/src/index.tsx",
  )
  expect(res.data.package_domain.fully_qualified_domain_name).toBe(
    "domain-test.tscircuit.app",
  )
  expect(res.data.package_domain.package_domain_id).toBeDefined()
  expect(res.data.package_domain.created_at).toBeDefined()
})

test("POST /api/package_domains/create - returns 400 for missing package_build_id", async () => {
  const { axios } = await getTestServer()

  const res = await axios.post(
    "/api/package_domains/create",
    {
      points_to: "package_build",
    },
    { validateStatus: () => true },
  )

  expect(res.status).toBe(400)
  expect(res.data.error.error_code).toBe("missing_package_build_id")
})

test("POST /api/package_domains/create - returns 400 for duplicate FQDN", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/domain-fqdn-test",
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
    fully_qualified_domain_name: "duplicate-fqdn.tscircuit.app",
  })

  const res = await axios.post(
    "/api/package_domains/create",
    {
      points_to: "package_build",
      package_build_id: packageBuild.package_build_id,
      fully_qualified_domain_name: "duplicate-fqdn.tscircuit.app",
    },
    { validateStatus: () => true },
  )

  expect(res.status).toBe(400)
  expect(res.data.error.error_code).toBe("domain_fqdn_exists")
})

test("POST /api/package_domains/create - creates domain with package_release", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/domain-release-test",
    description: "Test package",
  })

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: packageRes.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })

  const res = await axios.post("/api/package_domains/create", {
    points_to: "package_release",
    package_release_id: releaseRes.data.package_release.package_release_id,
    fully_qualified_domain_name: "release-domain.tscircuit.app",
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_domain.points_to).toBe("package_release")
  expect(res.data.package_domain.package_release_id).toBe(
    releaseRes.data.package_release.package_release_id,
  )
})
