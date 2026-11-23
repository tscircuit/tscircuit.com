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

test("POST /api/package_builds/create_local - requires uploaded dist files", async () => {
  const { axios, db, packageNameWithVersion, release } = await setup()

  await axios.post("/api/package_files/upload_archive", {
    package_name_with_version: packageNameWithVersion,
    archive_base64: archive([
      { file_path: "index.tsx", content_text: "export default () => null" },
    ]),
  })

  const res = await axios.post(
    "/api/package_builds/create_local",
    { package_release_id: release.package_release_id },
    { validateStatus: () => true },
  )

  expect(res.status).toBe(400)
  expect(res.data.error.error_code).toBe("missing_build_output")
  expect(db.getPackageBuildsByReleaseId(release.package_release_id)).toEqual([])
})
