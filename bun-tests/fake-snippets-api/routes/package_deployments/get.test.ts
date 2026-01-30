import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("GET /api/package_deployments/get - by id", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/deployment-get-test",
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
    fully_qualified_domain_name: "get-test.tscircuit.app",
  })

  const package_deployment_id =
    createRes.data.package_deployment.package_deployment_id

  const res = await axios.get(
    `/api/package_deployments/get?package_deployment_id=${package_deployment_id}`,
  )

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_deployment.package_deployment_id).toBe(
    package_deployment_id,
  )
})

test("GET /api/package_deployments/get - by FQDN", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/deployment-fqdn-get-test",
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
    fully_qualified_domain_name: "fqdn-get-test.tscircuit.app",
  })

  const package_deployment_id =
    createRes.data.package_deployment.package_deployment_id

  const res = await axios.get(
    `/api/package_deployments/get?fully_qualified_domain_name=fqdn-get-test.tscircuit.app`,
  )

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_deployment.package_deployment_id).toBe(
    package_deployment_id,
  )
})

test("GET /api/package_deployments/get - returns 400 without parameters", async () => {
  const { axios } = await getTestServer()

  const res = await axios.get("/api/package_deployments/get", {
    validateStatus: () => true,
  })

  expect(res.status).toBe(400)
  expect(res.data.error.error_code).toBe("missing_parameter")
})

test("GET /api/package_deployments/get - returns 404 for non-existent deployment", async () => {
  const { axios } = await getTestServer()

  const res = await axios.get(
    `/api/package_deployments/get?package_deployment_id=non-existent-id`,
    { validateStatus: () => true },
  )

  expect(res.status).toBe(404)
  expect(res.data.error.error_code).toBe("package_deployment_not_found")
})

test("GET /api/package_deployments/get - works without authentication", async () => {
  const { axios, unauthenticatedAxios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/deployment-unauth-test",
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
    fully_qualified_domain_name: "unauth-test.tscircuit.app",
  })

  const package_deployment_id =
    createRes.data.package_deployment.package_deployment_id

  const res = await unauthenticatedAxios.get(
    `/api/package_deployments/get?package_deployment_id=${package_deployment_id}`,
  )

  expect(res.status).toBe(200)
  expect(res.data.ok).toBe(true)
  expect(res.data.package_deployment.package_deployment_id).toBe(
    package_deployment_id,
  )
})
