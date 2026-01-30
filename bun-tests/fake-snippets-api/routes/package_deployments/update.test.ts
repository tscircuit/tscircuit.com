import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("POST /api/package_deployments/update - successfully updates deployment", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/deployment-update-test",
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

  const createRes = await axios.post("/api/package_deployments/create", {
    package_build_id: packageBuild.package_build_id,
    fully_qualified_domain_name: "update-test.tscircuit.app",
  })

  const package_deployment_id =
    createRes.data.package_deployment.package_deployment_id

  const res = await axios.post("/api/package_deployments/update", {
    package_deployment_id,
    default_main_component_path: "/src/updated.tsx",
    fully_qualified_domain_name: "updated-test.tscircuit.app",
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_deployment.default_main_component_path).toBe(
    "/src/updated.tsx",
  )
  expect(res.data.package_deployment.fully_qualified_domain_name).toBe(
    "updated-test.tscircuit.app",
  )
})

test("POST /api/package_deployments/update - returns 404 for non-existent deployment", async () => {
  const { axios } = await getTestServer()

  const res = await axios.post(
    "/api/package_deployments/update",
    {
      package_deployment_id: "non-existent-id",
      default_main_component_path: "/src/test.tsx",
    },
    { validateStatus: () => true },
  )

  expect(res.status).toBe(404)
  expect(res.data.error.error_code).toBe("package_deployment_not_found")
})

test("POST /api/package_deployments/update - returns 400 for duplicate FQDN", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/deployment-update-fqdn-test",
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

  await axios.post("/api/package_deployments/create", {
    package_build_id: packageBuild.package_build_id,
    fully_qualified_domain_name: "existing-fqdn.tscircuit.app",
  })

  const createRes2 = await axios.post("/api/package_deployments/create", {
    package_build_id: packageBuild.package_build_id,
    fully_qualified_domain_name: "another-fqdn.tscircuit.app",
  })

  const res = await axios.post(
    "/api/package_deployments/update",
    {
      package_deployment_id:
        createRes2.data.package_deployment.package_deployment_id,
      fully_qualified_domain_name: "existing-fqdn.tscircuit.app",
    },
    { validateStatus: () => true },
  )

  expect(res.status).toBe(400)
  expect(res.data.error.error_code).toBe("deployment_fqdn_exists")
})

test("POST /api/package_deployments/update - returns existing deployment when no updates provided", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/deployment-no-update-test",
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

  const createRes = await axios.post("/api/package_deployments/create", {
    package_build_id: packageBuild.package_build_id,
    fully_qualified_domain_name: "no-update-test.tscircuit.app",
  })

  const package_deployment_id =
    createRes.data.package_deployment.package_deployment_id

  const res = await axios.post("/api/package_deployments/update", {
    package_deployment_id,
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_deployment.package_deployment_id).toBe(
    package_deployment_id,
  )
  expect(res.data.package_deployment.fully_qualified_domain_name).toBe(
    "no-update-test.tscircuit.app",
  )
})

test("POST /api/package_deployments/update - can set fields to null", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/deployment-null-test",
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

  const createRes = await axios.post("/api/package_deployments/create", {
    package_build_id: packageBuild.package_build_id,
    default_main_component_path: "/src/index.tsx",
    fully_qualified_domain_name: "null-test.tscircuit.app",
  })

  const package_deployment_id =
    createRes.data.package_deployment.package_deployment_id

  const res = await axios.post("/api/package_deployments/update", {
    package_deployment_id,
    default_main_component_path: null,
    fully_qualified_domain_name: null,
  })

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_deployment.default_main_component_path).toBeNull()
  expect(res.data.package_deployment.fully_qualified_domain_name).toBeNull()
})
