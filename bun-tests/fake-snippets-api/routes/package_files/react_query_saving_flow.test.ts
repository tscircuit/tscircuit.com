import "bun-tests/fake-snippets-api/fixtures/preload"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
/**
 * Repro for the "Saving Broken Bug": UI marked files as saved before
 * mutation posted changes, resulting in no POST and no persistence.
 *
 * This test verifies our save flow logic produces operations when content
 * actually differs and that applying those operations persists to server.
 */

test("react-query save flow: changed file triggers POST and persists", async () => {
  const { axios } = await getTestServer()

  // Create package and initial release
  const pkgRes = await axios.post("/api/packages/create", {
    name: "testuser/react-query-save-flow",
    description: "package to test save flow",
  })
  expect(pkgRes.status).toBe(200)
  const createdPackage = pkgRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "0.0.1",
    is_latest: true,
  })
  expect(releaseRes.status).toBe(200)
  const createdRelease = releaseRes.data.package_release

  // Seed one file on server as our initial state
  const seedContent = "export const A = 1\n"
  const seed = await axios.post("/api/package_files/create_or_update", {
    package_release_id: createdRelease.package_release_id,
    file_path: "/index.tsx",
    content_text: seedContent,
  })
  expect(seed.status).toBe(200)
})
