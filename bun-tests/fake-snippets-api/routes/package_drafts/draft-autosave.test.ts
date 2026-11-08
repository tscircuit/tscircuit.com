import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

const createPackage = async (axios: any, name: string) => {
  const response = await axios.post("/api/packages/create", {
    name: `testuser/${name}`,
    description: "Draft autosave test",
  })
  return response.data.package.package_id as string
}

test("save multiple revisions, reopen draft, and never build on autosave", async () => {
  const { axios, db } = await getTestServer()
  const packageId = await createPackage(axios, "draft-autosave")
  const buildsBefore = db.packageBuilds.length
  const releasesBefore = db.packageReleases.length

  let expectedRevision = 0
  for (const version of ["first", "second", "third"]) {
    const response = await axios.post("/api/package_drafts/save", {
      package_id: packageId,
      expected_revision: expectedRevision,
      files: [
        { path: "index.tsx", content: version },
        { path: "manual-edits.json", content: "{}" },
      ],
    })
    expect(response.data.build_triggered).toBe(false)
    expectedRevision = response.data.draft.revision
  }

  // A new browser load reads the persisted server state, not an old release.
  const reopened = await axios.get("/api/package_drafts/get", {
    params: { package_id: packageId },
  })
  expect(reopened.data.draft.revision).toBe(3)
  expect(reopened.data.draft.files).toEqual([
    { path: "index.tsx", content: "third" },
    { path: "manual-edits.json", content: "{}" },
  ])
  expect(db.packageBuilds.length).toBe(buildsBefore)
  expect(db.packageReleases.length).toBe(releasesBefore)
})

test("reject stale saves without overwriting newer revisions", async () => {
  const { axios } = await getTestServer()
  const packageId = await createPackage(axios, "draft-conflict")
  await axios.post("/api/package_drafts/save", {
    package_id: packageId,
    expected_revision: 0,
    files: [{ path: "index.tsx", content: "new code" }],
  })

  try {
    await axios.post("/api/package_drafts/save", {
      package_id: packageId,
      expected_revision: 0,
      files: [{ path: "index.tsx", content: "stale code" }],
    })
    throw new Error("Expected stale save to fail")
  } catch (error: any) {
    expect(error.status).toBe(409)
    expect(error.data.error.error_code).toBe("revision_conflict")
  }
  const reread = await axios.get("/api/package_drafts/get", {
    params: { package_id: packageId },
  })
  expect(reread.data.draft.files[0].content).toBe("new code")
})

test("cannot read, save, or build another user's draft", async () => {
  const { axios, jane_axios, unauthenticatedAxios } = await getTestServer()
  const packageId = await createPackage(axios, "draft-auth")
  for (const request of [
    () =>
      jane_axios.get("/api/package_drafts/get", {
        params: { package_id: packageId },
      }),
    () =>
      jane_axios.post("/api/package_drafts/save", {
        package_id: packageId,
        expected_revision: 0,
        files: [],
      }),
    () =>
      jane_axios.post("/api/package_drafts/build", {
        package_id: packageId,
        expected_revision: 1,
      }),
  ]) {
    try {
      await request()
      throw new Error("Expected forbidden response")
    } catch (error: any) {
      expect(error.status).toBe(403)
    }
  }
  try {
    await unauthenticatedAxios.get("/api/package_drafts/get", {
      params: { package_id: packageId },
    })
    throw new Error("Expected unauthenticated request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
  }
})

test("Build & Exit uses a frozen snapshot and never changes the latest release", async () => {
  const { axios, db } = await getTestServer()
  const packageId = await createPackage(axios, "draft-build-and-exit")
  const initialRelease = await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "1.0.0",
    is_latest: true,
  })
  const latestId = initialRelease.data.package_release.package_release_id
  const buildCount = db.packageBuilds.length
  await axios.post("/api/package_drafts/save", {
    package_id: packageId,
    expected_revision: 0,
    files: [
      { path: "index.tsx", content: "snapshot 1" },
      { path: "manual-edits.json", content: "{}" },
    ],
  })

  const queued = await axios.post("/api/package_drafts/build", {
    package_id: packageId,
    expected_revision: 1,
  })
  expect(queued.data.build_requested).toBe(true)
  expect(db.packageBuilds.length).toBe(buildCount + 1)
  expect(
    db.packageReleases.find(
      (r) => r.package_release_id === queued.data.package_release_id,
    )?.ready_to_build,
  ).toBe(true)
  expect(
    db.packages.find((p) => p.package_id === packageId)
      ?.latest_package_release_id,
  ).toBe(latestId)
  expect(
    db
      .getPackageFilesByReleaseId(queued.data.package_release_id)
      .find((f) => f.file_path === "index.tsx")?.content_text,
  ).toBe("snapshot 1")

  // Duplicate clicks must not enqueue duplicate builds.
  const again = await axios.post("/api/package_drafts/build", {
    package_id: packageId,
    expected_revision: 1,
  })
  expect(again.data.package_build_id).toBe(queued.data.package_build_id)
  expect(db.packageBuilds.length).toBe(buildCount + 1)

  await axios.post("/api/package_drafts/save", {
    package_id: packageId,
    expected_revision: 1,
    files: [{ path: "index.tsx", content: "snapshot 2" }],
  })
  expect(
    db
      .getPackageFilesByReleaseId(queued.data.package_release_id)
      .find((f) => f.file_path === "index.tsx")?.content_text,
  ).toBe("snapshot 1")
})
