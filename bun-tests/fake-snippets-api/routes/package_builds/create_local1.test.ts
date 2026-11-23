import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { gzipSync } from "node:zlib"

const archive = (files: unknown[]) =>
  gzipSync(JSON.stringify({ files })).toString("base64")

const setup = async () => {
  const fixture = await getTestServer()
  const name = "testuser/local-build"
  const {
    data: { package: pkg },
  } = await fixture.axios.post("/api/packages/create", { name })
  // Production accepts UUID release IDs. Seed one without changing fake DB IDs globally.
  const releaseInput = {
    package_release_id: crypto.randomUUID(),
    package_id: pkg.package_id,
    version: "1.0.0",
    created_at: new Date().toISOString(),
    is_latest: true,
    is_locked: false,
  }
  const release = fixture.db.addPackageRelease(releaseInput)
  return { ...fixture, packageNameWithVersion: `${name}@1.0.0`, release, pkg }
}

test("POST /api/package_builds/create_local - uses the uploaded dist as a local build", async () => {
  const { axios, db, packageNameWithVersion, release, pkg } = await setup()

  await axios.post("/api/package_files/upload_archive", {
    package_name_with_version: packageNameWithVersion,
    skip_cloud_build: true,
    archive_base64: archive([
      { file_path: "index.tsx", content_text: "export default () => null" },
      { file_path: "dist/circuit.json", content_text: "[]" },
    ]),
  })

  // The upload keeps the uploaded build output and doesn't request a build
  expect(
    db
      .getPackageFilesByReleaseId(release.package_release_id)
      .map((file) => file.file_path)
      .sort(),
  ).toEqual(["dist/circuit.json", "index.tsx"])
  expect(
    db.getPackageReleaseById(release.package_release_id)?.ready_to_build,
  ).toBe(false)

  const { data } = await axios.post("/api/package_builds/create_local", {
    package_name_with_version: packageNameWithVersion,
  })

  expect(data.package_build.build_source).toBe("local")
  expect(data.package_build.build_in_progress).toBe(false)
  expect(data.package_build.user_code_job_completed_at).toBeTruthy()

  const {
    data: { package_release },
  } = await axios.post("/api/package_releases/get", {
    package_release_id: release.package_release_id,
  })
  expect(package_release.build_source).toBe("local")
  expect(package_release.latest_package_build_id).toBe(
    data.package_build.package_build_id,
  )
  expect(package_release.user_code_job_completed_at).toBeTruthy()

  // The package must still be readable after its release was built locally
  const packageRes = await axios.get("/api/packages/get", {
    params: { package_id: pkg.package_id },
  })
  expect(packageRes.data.package.package_id).toBe(pkg.package_id)
})
