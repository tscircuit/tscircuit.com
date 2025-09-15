import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"
import defaultAxios from "redaxios"

export const createTestPackage = async (axios: typeof defaultAxios) => {
  const packageRes = await axios.post("/api/packages/create", {
    json: {
      name: "test-package",
      description: "Test package for builds",
    },
  })
  return packageRes.data
}

export const createTestPackageRelease = async (
  axios: typeof defaultAxios,
  packageId: string,
) => {
  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "1.0.0",
    is_latest: true,
  })
  return releaseRes.data
}

test("GET /api/package_builds/get - requires package_build_id", async () => {
  const { jane_axios } = await getTestServer()
  const res = await jane_axios.get("/api/package_builds/get", {
    validateStatus: () => true,
  })
  expect(res.status).toBe(400)
})

test("GET /api/package_builds/get - returns 404 for non-existent package build", async () => {
  const { jane_axios } = await getTestServer()
  const res = await jane_axios.get(
    "/api/package_builds/get?package_build_id=non-existent-build",
    { validateStatus: () => true },
  )
  expect(res.status).toBe(404)
  expect(res.data.error.error_code).toBe("package_build_not_found")
  expect(res.data.error.message).toBe("Package build not found")
})

test("GET /api/package_builds/get - returns 403 for unauthorized package build access", async () => {
  const { jane_axios, axios, db } = await getTestServer()
  const packageData = await createTestPackage(jane_axios)
  const { package_release } = await createTestPackageRelease(
    jane_axios,
    packageData.package.package_id,
  )

  const packageBuild = db.addPackageBuild({
    package_release_id: package_release.package_release_id,
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
    preview_url: "https://preview.tscircuit.com/pb_test",
  })

  const res = await axios.get(
    `/api/package_builds/get?package_build_id=${packageBuild.package_build_id}`,
    { validateStatus: () => true },
  )
  expect(res.status).toBe(403)
  expect(res.data.error.error_code).toBe("unauthorized")
})

test("GET /api/package_builds/get - successfully returns package build with logs", async () => {
  const { axios, db } = await getTestServer()
  const { package: pkg } = await createTestPackage(axios)
  const { package_release } = await createTestPackageRelease(
    axios,
    pkg.package_id,
  )

  const buildLogs = ["Started build", "Building components", "Build completed"]
  const transpilationLogs = ["Transpiling files", "Transpilation done"]
  const circuitJsonBuildLogs = ["Generating circuit JSON", "Circuit JSON ready"]

  const packageBuild = db.addPackageBuild({
    package_release_id: package_release.package_release_id,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(
      Date.now() - 1000 * 60 * 35,
    ).toISOString(),
    transpilation_completed_at: new Date(
      Date.now() - 1000 * 60 * 32,
    ).toISOString(),
    transpilation_logs: transpilationLogs,
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(
      Date.now() - 1000 * 60 * 32,
    ).toISOString(),
    circuit_json_build_completed_at: new Date(
      Date.now() - 1000 * 60 * 30,
    ).toISOString(),
    circuit_json_build_logs: circuitJsonBuildLogs,
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    build_completed_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date(
      Date.now() - 1000 * 60 * 25,
    ).toISOString(),
    build_logs: buildLogs.join(" "),
    preview_url: "https://preview.tscircuit.com/pb_1a2b3c4d",
  })

  const res = await axios.get(
    `/api/package_builds/get?package_build_id=${packageBuild.package_build_id}`,
  )
  expect(res.status).toBe(200)
  expect(res.data.package_build).toBeDefined()
  expect(res.data.package_build.package_build_id).toBe(
    packageBuild.package_build_id,
  )
  expect(res.data.package_build.transpilation_logs).toEqual(transpilationLogs)
  expect(res.data.package_build.circuit_json_build_logs).toEqual(
    circuitJsonBuildLogs,
  )
  expect(res.data.package_build.build_logs).toBe(buildLogs.join(" "))
})

test("GET /api/package_builds/get - returns package build without logs when include_logs is false", async () => {
  const { axios, db } = await getTestServer()
  const { package: pkg } = await createTestPackage(axios)
  const { package_release } = await createTestPackageRelease(
    axios,
    pkg.package_id,
  )

  const packageBuild = db.addPackageBuild({
    package_release_id: package_release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date().toISOString(),
    transpilation_completed_at: new Date().toISOString(),
    transpilation_logs: ["Some logs"],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date().toISOString(),
    circuit_json_build_completed_at: new Date().toISOString(),
    circuit_json_build_logs: ["Some circuit logs"],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date().toISOString(),
    build_completed_at: new Date().toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    build_logs: "Some build logs",
    preview_url: "https://preview.tscircuit.com/pb_test",
  })

  const res = await axios.get(
    `/api/package_builds/get?package_build_id=${packageBuild.package_build_id}`,
  )
  expect(res.status).toBe(200)
  expect(res.data.package_build).toBeDefined()
  expect(res.data.package_build.package_build_id).toBe(
    packageBuild.package_build_id,
  )
  expect(res.data.package_build.transpilation_logs).toEqual(["Some logs"])
  expect(res.data.package_build.circuit_json_build_logs).toEqual([
    "Some circuit logs",
  ])
  expect(res.data.package_build.build_logs).toBe("Some build logs")
})

test("GET /api/package_builds/get - handles build with errors", async () => {
  const { axios, db } = await getTestServer()
  const { package: pkg } = await createTestPackage(axios)
  const { package_release } = await createTestPackageRelease(
    axios,
    pkg.package_id,
  )

  const packageBuild = db.addPackageBuild({
    package_release_id: package_release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date().toISOString(),
    transpilation_completed_at: null,
    transpilation_logs: [],
    transpilation_error: "Transpilation failed: syntax error",
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: null,
    circuit_json_build_completed_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_error: "Circuit JSON build failed",
    build_in_progress: false,
    build_started_at: new Date().toISOString(),
    build_completed_at: null,
    build_error: "Build failed: compilation error",
    build_error_last_updated_at: new Date().toISOString(),
    build_logs: null,
    preview_url: null,
  })

  const res = await axios.get(
    `/api/package_builds/get?package_build_id=${packageBuild.package_build_id}`,
  )
  expect(res.status).toBe(200)
  expect(res.data.package_build).toBeDefined()
  expect(res.data.package_build.package_build_id).toBe(
    packageBuild.package_build_id,
  )
  expect(res.data.package_build.transpilation_error).toBe(
    "Transpilation failed: syntax error",
  )
  expect(res.data.package_build.circuit_json_build_error).toBe(
    "Circuit JSON build failed",
  )
  expect(res.data.package_build.build_error).toBe(
    "Build failed: compilation error",
  )
})

test("GET /api/package_builds/get - handles build in progress", async () => {
  const { axios, db } = await getTestServer()
  const { package: pkg } = await createTestPackage(axios)
  const { package_release } = await createTestPackageRelease(
    axios,
    pkg.package_id,
  )

  const packageBuild = db.addPackageBuild({
    package_release_id: package_release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_in_progress: true,
    transpilation_started_at: new Date().toISOString(),
    transpilation_completed_at: null,
    transpilation_logs: ["Starting transpilation"],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: null,
    circuit_json_build_completed_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: null,
    build_completed_at: null,
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    build_logs: null,
    preview_url: null,
  })

  const res = await axios.get(
    `/api/package_builds/get?package_build_id=${packageBuild.package_build_id}`,
  )
  expect(res.status).toBe(200)
  expect(res.data.package_build).toBeDefined()
  expect(res.data.package_build.package_build_id).toBe(
    packageBuild.package_build_id,
  )
  expect(res.data.package_build.transpilation_in_progress).toBe(true)
  expect(res.data.package_build.transpilation_logs).toEqual([
    "Starting transpilation",
  ])
})
