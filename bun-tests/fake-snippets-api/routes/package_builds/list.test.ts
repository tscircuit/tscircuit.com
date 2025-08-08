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

test("GET /api/package_builds/list - requires package_id or package_release_id", async () => {
  const { jane_axios } = await getTestServer()
  const res = await jane_axios.get("/api/package_builds/list", {
    validateStatus: () => true,
  })
  expect(res.status).toBe(400)
})

test("GET /api/package_builds/list - filters by package_id", async () => {
  const { jane_axios } = await getTestServer()
  const packageRes = await createTestPackage(jane_axios)
  await createTestPackageRelease(jane_axios, packageRes.package.package_id)
  const res = await jane_axios.get(
    `/api/package_builds/list?package_id=${packageRes.package.package_id}`,
  )
  expect(res.status).toBe(200)
  expect(Array.isArray(res.data.package_builds)).toBe(true)
})

test("GET /api/package_builds/list - filters by package_release_id", async () => {
  const { jane_axios } = await getTestServer()
  const packageRes = await createTestPackage(jane_axios)
  const { package_release } = await createTestPackageRelease(
    jane_axios,
    packageRes.package.package_id,
  )
  const res = await jane_axios.get(
    `/api/package_builds/list?package_release_id=${package_release.package_release_id}`,
  )
  expect(res.status).toBe(200)
  expect(Array.isArray(res.data.package_builds)).toBe(true)
})

test("GET /api/package_builds/list - returns 404 for non-existent package", async () => {
  const { jane_axios } = await getTestServer()
  const res = await jane_axios.get(
    "/api/package_builds/list?package_id=non-existent-package",
    { validateStatus: () => true },
  )
  expect(res.status).toBe(404)
  expect(res.data.error.error_code).toBe("package_not_found")
})

test("GET /api/package_builds/list - returns 404 for non-existent package release", async () => {
  const { jane_axios } = await getTestServer()
  const res = await jane_axios.get(
    "/api/package_builds/list?package_release_id=non-existent-package",
    { validateStatus: () => true },
  )
  expect(res.status).toBe(404)
  expect(res.data.error.error_code).toBe("package_release_not_found")
})

test("GET /api/package_builds/list - returns 403 for unauthorized package access", async () => {
  const { jane_axios, axios } = await getTestServer()
  const packageData = await createTestPackage(jane_axios)
  const res = await axios.get(
    `/api/package_builds/list?package_id=${packageData.package.package_id}`,
    { validateStatus: () => true },
  )
  expect(res.status).toBe(403)
})

test("GET /api/package_builds/list - returns created builds", async () => {
  const { axios, db } = await getTestServer()
  const { package: pkg } = await createTestPackage(axios)
  const { package_release } = await createTestPackageRelease(
    axios,
    pkg.package_id,
  )

  db.addPackageBuild({
    package_release_id: package_release.package_release_id,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(
      Date.now() - 1000 * 60 * 35,
    ).toISOString(),
    transpilation_completed_at: new Date(
      Date.now() - 1000 * 60 * 32,
    ).toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(
      Date.now() - 1000 * 60 * 32,
    ).toISOString(),
    circuit_json_build_completed_at: new Date(
      Date.now() - 1000 * 60 * 30,
    ).toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    build_completed_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date(
      Date.now() - 1000 * 60 * 25,
    ).toISOString(),
    build_logs: null,
    preview_url: "https://preview.tscircuit.com/pb_1a2b3c4d",
  })

  const res = await axios.get(
    `/api/package_builds/list?package_id=${pkg.package_id}`,
  )
  expect(res.status).toBe(200)
  expect(res.data.package_builds.length).toBe(1)
})

test("GET /api/package_builds/list - sorts builds by created_at descending", async () => {
  const { axios, db } = await getTestServer()
  const { package: pkg } = await createTestPackage(axios)
  const { package_release } = await createTestPackageRelease(
    axios,
    pkg.package_id,
  )

  db.addPackageBuild({
    package_release_id: package_release.package_release_id,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(
      Date.now() - 1000 * 60 * 35,
    ).toISOString(),
    transpilation_completed_at: new Date(
      Date.now() - 1000 * 60 * 32,
    ).toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(
      Date.now() - 1000 * 60 * 32,
    ).toISOString(),
    circuit_json_build_completed_at: new Date(
      Date.now() - 1000 * 60 * 30,
    ).toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    build_completed_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date(
      Date.now() - 1000 * 60 * 25,
    ).toISOString(),
    build_logs: null,
    preview_url: "https://preview.tscircuit.com/pb_1",
  })

  db.addPackageBuild({
    package_release_id: package_release.package_release_id,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(
      Date.now() - 1000 * 60 * 20,
    ).toISOString(),
    transpilation_completed_at: new Date(
      Date.now() - 1000 * 60 * 17,
    ).toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(
      Date.now() - 1000 * 60 * 17,
    ).toISOString(),
    circuit_json_build_completed_at: new Date(
      Date.now() - 1000 * 60 * 15,
    ).toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    build_completed_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date(
      Date.now() - 1000 * 60 * 10,
    ).toISOString(),
    build_logs: null,
    preview_url: "https://preview.tscircuit.com/pb_2",
  })

  const res = await axios.get(
    `/api/package_builds/list?package_id=${pkg.package_id}`,
  )
  expect(res.status).toBe(200)
  expect(Array.isArray(res.data.package_builds)).toBe(true)
  expect(res.data.package_builds.length).toBe(2)

  const builds = res.data.package_builds
  for (let i = 1; i < builds.length; i++) {
    const prevBuild = new Date(builds[i - 1].created_at)
    const currentBuild = new Date(builds[i].created_at)
    expect(prevBuild.getTime()).toBeGreaterThanOrEqual(currentBuild.getTime())
  }
})

test("GET /api/package_builds/list - handles both package_id and package_release_id (package_release_id takes precedence)", async () => {
  const { jane_axios } = await getTestServer()
  const packageRes = await createTestPackage(jane_axios)
  const { package_release } = await createTestPackageRelease(
    jane_axios,
    packageRes.package.package_id,
  )
  const res = await jane_axios.get(
    `/api/package_builds/list?package_id=${packageRes.package.package_id}&package_release_id=${package_release.package_release_id}`,
  )
  expect(res.status).toBe(200)
  expect(Array.isArray(res.data.package_builds)).toBe(true)
})

test("GET /api/package_builds/list - returns created builds with logs or not", async () => {
  const { axios, db } = await getTestServer()
  const { package: pkg } = await createTestPackage(axios)
  const { package_release } = await createTestPackageRelease(
    axios,
    pkg.package_id,
  )

  const buildLogs = ["Started build", "Building components", "Build completed"]
  const transpilationLogs = ["Transpiling files", "Transpilation done"]
  const circuitJsonBuildLogs = ["Generating circuit JSON", "Circuit JSON ready"]

  await db.addPackageBuild({
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

  const resWithoutLogs = await axios.get(
    `/api/package_builds/list?package_id=${pkg.package_id}`,
  )
  expect(resWithoutLogs.status).toBe(200)
  expect(resWithoutLogs.data.package_builds.length).toBe(1)
  expect(resWithoutLogs.data.package_builds[0].build_logs).toBeNull()
  expect(resWithoutLogs.data.package_builds[0].transpilation_logs).toEqual([])
  expect(resWithoutLogs.data.package_builds[0].circuit_json_build_logs).toEqual(
    [],
  )
})
