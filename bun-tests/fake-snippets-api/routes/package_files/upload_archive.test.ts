import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { gzipSync } from "node:zlib"

const setup = async () => {
  const fixture = await getTestServer()
  const name = "testuser/archive-upload"
  const {
    data: { package: pkg },
  } = await fixture.axios.post("/api/packages/create", { name })
  const {
    data: { package_release: release },
  } = await fixture.axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
  })
  return { ...fixture, packageNameWithVersion: `${name}@1.0.0`, release }
}

test("archive uploads preserve text, empty files, and binary bytes and upsert existing paths", async () => {
  const { axios, db, packageNameWithVersion, release } = await setup()
  const files = [
    { file_path: "index.tsx", content_text: "// First upload" },
    { file_path: "empty.txt", content_text: "" },
    {
      file_path: "image.png",
      content_base64: Buffer.from([0, 1, 2, 255]).toString("base64"),
    },
  ]
  const upload = () =>
    axios.post("/api/package_files/upload_archive", {
      package_name_with_version: packageNameWithVersion,
      archive_base64: gzipSync(JSON.stringify({ files })).toString("base64"),
    })
  const first = await upload()
  expect(first.status).toBe(200)
  expect(first.data.package_files).toHaveLength(3)
  const firstFileId = first.data.package_files[0].package_file_id
  const originalFsSha = db.packageReleases.find(
    (r) => r.package_release_id === release.package_release_id,
  )!.fs_sha
  files[0].content_text = "// Second upload"
  const second = await upload()
  expect(second.data.package_files[0].package_file_id).toBe(firstFileId)
  expect(
    db.packageFiles.filter(
      (file) => file.package_release_id === release.package_release_id,
    ),
  ).toHaveLength(3)
  expect(
    db.packageReleases.find(
      (r) => r.package_release_id === release.package_release_id,
    )!.fs_sha,
  ).not.toBe(originalFsSha)
  for (const file of second.data.package_files) {
    const response = await axios.get("/api/package_files/download", {
      params: { package_file_id: file.package_file_id },
      responseType: "arrayBuffer",
    })
    const expected =
      file.file_path === "image.png"
        ? Buffer.from([0, 1, 2, 255])
        : Buffer.from(file.file_path === "empty.txt" ? "" : "// Second upload")
    expect(Buffer.from(response.data)).toEqual(expected)
  }
})

test("invalid archives do not partially store files", async () => {
  const { axios, db, release } = await setup()
  const files = [
    { file_path: "valid.txt", content_text: "Valid file" },
    { file_path: "../invalid.txt", content_text: "Invalid path" },
  ]
  await expect(
    axios.post("/api/package_files/upload_archive", {
      package_release_id: release.package_release_id,
      archive_base64: gzipSync(JSON.stringify({ files })).toString("base64"),
    }),
  ).rejects.toMatchObject({
    status: 400,
    data: { error: { error_code: "invalid_archive" } },
  })
  expect(
    db.packageFiles.filter(
      (file) => file.package_release_id === release.package_release_id,
    ),
  ).toEqual([])
  await expect(
    axios.post("/api/package_files/upload_archive", {
      package_release_id: release.package_release_id,
      archive_base64: "not-gzip",
    }),
  ).rejects.toMatchObject({ status: 400 })
})

test("archive uploads enforce release existence and package permissions", async () => {
  const { jane_axios, axios, db, release } = await setup()
  const payload = {
    package_release_id: release.package_release_id,
    archive_base64: gzipSync(
      JSON.stringify({
        files: [{ file_path: "index.tsx", content_text: "// Test" }],
      }),
    ).toString("base64"),
  }
  await expect(
    jane_axios.post("/api/package_files/upload_archive", payload),
  ).rejects.toMatchObject({ status: 403 })
  await expect(
    axios.post("/api/package_files/upload_archive", {
      ...payload,
      package_release_id: "missing-release",
    }),
  ).rejects.toMatchObject({ status: 404 })
  expect(
    db.packageFiles.filter(
      (file) => file.package_release_id === release.package_release_id,
    ),
  ).toEqual([])
})
