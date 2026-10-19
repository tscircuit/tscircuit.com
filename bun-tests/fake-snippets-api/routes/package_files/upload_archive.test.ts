import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { gzipSync } from "node:zlib"

const archive = (files: unknown[]) =>
  gzipSync(JSON.stringify({ files })).toString("base64")

const setup = async () => {
  const fixture = await getTestServer()
  const name = "testuser/archive-upload"
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

test("JSON archive uploads match production metadata, MIME inference, and downloadable bytes", async () => {
  const { axios, db, packageNameWithVersion, release } = await setup()
  const files = [
    {
      file_path: "./src//index.tsx",
      content_text: "export const name = 'résistor'",
    },
    { file_path: "README.md", content_text: "# Archive" },
    { file_path: "empty.txt", content_text: "" },
    { file_path: "LICENSE" },
    { file_path: "assets/logo.png", content_base64: "AAEC/w==" },
    { file_path: "data.unknown", content_base64: "AAEC/w==" },
    {
      file_path: "custom.json",
      content_text: "{}",
      content_mimetype: "text/custom",
    },
    { file_path: "default.json", content_text: "{}", content_mimetype: "" },
  ]
  const { data, status } = await axios.post(
    "/api/package_files/upload_archive",
    {
      package_name_with_version: packageNameWithVersion.toUpperCase(),
      archive_base64: archive(files),
    },
  )
  expect(status).toBe(200)
  expect(data.ok).toBe(true)
  expect(data.package_files).toHaveLength(files.length)
  expect(data.package_files.map((file: any) => file.content_mimetype)).toEqual([
    "text/typescript",
    "text/markdown",
    "text/plain",
    "application/octet-stream",
    "image/png",
    "application/octet-stream",
    "text/custom",
    "application/json",
  ])
  expect(data.package_files[0].file_path).toBe("src/index.tsx")
  for (const [index, file] of data.package_files.entries()) {
    expect(Object.keys(file).sort()).toEqual([
      "content_mimetype",
      "created_at",
      "file_path",
      "package_file_id",
      "package_release_id",
    ])
    expect(file.package_release_id).toBe(release.package_release_id)
    expect(new Date(file.created_at).toISOString()).toBe(file.created_at)
    const response = await axios.get("/api/package_files/download", {
      params: { package_file_id: file.package_file_id },
      responseType: "arrayBuffer",
    })
    const input = files[index]
    const expected =
      input.content_text !== undefined
        ? Buffer.from(input.content_text)
        : Buffer.from(input.content_base64 ?? "", "base64")
    expect(Buffer.from(response.data)).toEqual(expected)
  }
  const stored = db.packageFiles.filter(
    (file) => file.package_release_id === release.package_release_id,
  )
  expect(stored[2].is_text).toBe(true)
  expect(stored[3].is_text).toBe(false)
})

test.each(["archive", "archive_base64"])(
  "multipart uploads accept %s with the same response as JSON",
  async (field) => {
    const { url, seed, release, axios } = await setup()
    const files = [
      { file_path: "index.ts", content_text: "export const value = 1" },
    ]
    const form = new FormData()
    form.append("package_release_id", release.package_release_id)
    form.append(
      field,
      field === "archive"
        ? new File([gzipSync(JSON.stringify({ files }))], "archive.json.gz", {
            type: "application/gzip",
          })
        : archive(files),
    )
    const response = await fetch(`${url}/api/package_files/upload_archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${seed.account.account_id}` },
      body: form,
    })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({
      ok: true,
      package_files: [
        { file_path: "index.ts", content_mimetype: "text/typescript" },
      ],
    })
    const downloaded = await axios.get("/api/package_files/download", {
      params: { package_file_id: data.package_files[0].package_file_id },
      responseType: "arrayBuffer",
    })
    expect(Buffer.from(downloaded.data).toString()).toBe(files[0].content_text)
  },
)

test("multipart archive_base64 takes precedence over an archive File", async () => {
  const { url, seed, packageNameWithVersion } = await setup()
  const form = new FormData()
  form.append("package_name_with_version", packageNameWithVersion)
  form.append(
    "archive_base64",
    archive([{ file_path: "chosen.ts", content_text: "chosen" }]),
  )
  form.append("archive", new File(["not gzip"], "ignored.gz"))
  const response = await fetch(`${url}/api/package_files/upload_archive`, {
    method: "POST",
    headers: { Authorization: `Bearer ${seed.account.account_id}` },
    body: form,
  })
  expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({
    package_files: [{ file_path: "chosen.ts" }],
  })
})

test("invalid request envelopes return production invalid_upload_payload errors", async () => {
  const { axios, url, seed, release, packageNameWithVersion, db } =
    await setup()
  const archive_base64 = archive([
    { file_path: "index.ts", content_text: "valid" },
  ])
  for (const payload of [
    {},
    { archive_base64 },
    { package_release_id: "not-a-uuid", archive_base64 },
    { package_name_with_version: "testuser/archive-upload", archive_base64 },
    {
      package_release_id: release.package_release_id,
      package_name_with_version: packageNameWithVersion,
      archive_base64,
    },
    { package_release_id: release.package_release_id },
    { package_release_id: release.package_release_id, archive_base64: 42 },
  ]) {
    await expect(
      axios.post("/api/package_files/upload_archive", payload),
    ).rejects.toMatchObject({
      status: 400,
      data: {
        error: {
          error_code: "invalid_upload_payload",
          message:
            "Expected JSON with archive_base64 or multipart/form-data with archive file",
        },
      },
    })
  }
  for (const body of [
    "{",
    new FormData(),
    (() => {
      const form = new FormData()
      form.append("package_release_id", release.package_release_id)
      return form
    })(),
  ]) {
    const response = await fetch(`${url}/api/package_files/upload_archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${seed.account.account_id}` },
      body,
    })
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      error: { error_code: "invalid_upload_payload" },
    })
  }
  expect(
    db.getPackageFilesByReleaseId(release.package_release_id),
  ).toHaveLength(0)
})

test("gzip/JSON failures and invalid archive schemas have distinct production messages", async () => {
  const { axios, release, db } = await setup()
  for (const archive_base64 of [
    "",
    Buffer.from("not gzip").toString("base64"),
    gzipSync("{").toString("base64"),
  ]) {
    await expect(
      axios.post("/api/package_files/upload_archive", {
        package_release_id: release.package_release_id,
        archive_base64,
      }),
    ).rejects.toMatchObject({
      status: 400,
      data: {
        error: {
          error_code: "invalid_archive",
          message:
            "archive must be a gzipped JSON payload containing a files array",
        },
      },
    })
  }
  for (const files of [
    [],
    [{ content_text: "missing path" }],
    [{ file_path: "index.ts", content_text: "text", content_base64: "Yg==" }],
  ]) {
    await expect(
      axios.post("/api/package_files/upload_archive", {
        package_release_id: release.package_release_id,
        archive_base64: archive(files),
      }),
    ).rejects.toMatchObject({
      status: 400,
      data: {
        error: {
          error_code: "invalid_archive",
          message: "Archive payload is invalid",
        },
      },
    })
  }
  expect(
    db.getPackageFilesByReleaseId(release.package_release_id),
  ).toHaveLength(0)
  // Production allows an empty text string alongside base64; text takes precedence.
  const result = await axios.post("/api/package_files/upload_archive", {
    package_release_id: release.package_release_id,
    archive_base64: archive([
      { file_path: "empty.txt", content_text: "", content_base64: "Yg==" },
    ]),
  })
  expect(result.status).toBe(200)
  expect(
    db.getPackageFilesByReleaseId(release.package_release_id)[0].content_bytes,
  ).toEqual(Buffer.from(""))
})

test("invalid paths and duplicate normalized paths fail atomically like the production transaction", async () => {
  const { axios, release, db } = await setup()
  for (const files of [
    [
      { file_path: "valid.ts", content_text: "valid" },
      { file_path: "../invalid.ts", content_text: "bad" },
    ],
    [
      { file_path: "index.ts", content_text: "first" },
      { file_path: "./index.ts", content_text: "second" },
    ],
  ]) {
    await expect(
      axios.post("/api/package_files/upload_archive", {
        package_release_id: release.package_release_id,
        archive_base64: archive(files),
      }),
    ).rejects.toMatchObject({ status: 500 })
    expect(
      db.getPackageFilesByReleaseId(release.package_release_id),
    ).toHaveLength(0)
    expect(
      db.getPackageReleaseById(release.package_release_id)?.ready_to_build,
    ).toBe(false)
  }
})

test("upserts preserve IDs, reset build state, clear tarball metadata, and remove stale circuit JSON", async () => {
  const { axios, db, release, pkg, packageNameWithVersion } = await setup()
  const oldDate = "2000-01-01T00:00:00.000Z"
  const buildState = {
    pcb_trace_count: 10,
    active_package_build_id: "build-old",
    circuit_json_build_error: "old error",
    circuit_json_build_error_last_updated_at: oldDate,
    has_transpiled: true,
    transpilation_error: "old error",
    transpilation_in_progress: true,
    transpilation_started_at: oldDate,
    transpilation_completed_at: oldDate,
    transpilation_logs: ["old"],
    image_generation_error: "old error",
    image_generation_error_last_updated_at: oldDate,
    image_generation_in_progress: true,
    image_generation_started_at: oldDate,
    image_generation_completed_at: oldDate,
    image_generation_logs: ["old"],
  }
  db.updatePackageRelease({ ...release, ...buildState })
  db.updatePackage(pkg.package_id, { updated_at: oldDate })
  const existing = db.addPackageFile({
    package_release_id: release.package_release_id,
    file_path: "./index.tsx",
    content_text: "old",
    content_bytes: Buffer.from("old"),
    content_mimetype: "text/plain",
    is_text: true,
    is_release_tarball: true,
    npm_pack_output: "old output",
    created_at: oldDate,
  })
  const { package_file_id: _, ...existingValues } = existing
  db.addPackageFile({
    ...existingValues,
    file_path: "./dist/circuit.json",
    content_text: "[]",
  })
  const result = await axios.post("/api/package_files/upload_archive", {
    package_name_with_version: packageNameWithVersion.replace(
      "1.0.0",
      "latest",
    ),
    archive_base64: archive([
      { file_path: "index.tsx", content_text: "new" },
      { file_path: "dist/circuit.json", content_text: "[]" },
    ]),
  })
  expect(result.data.package_files).toHaveLength(2)
  expect(result.data.package_files[0].package_file_id).toBe(
    existing.package_file_id,
  )
  const saved = db.getPackageFilesByReleaseId(release.package_release_id)
  expect(saved).toHaveLength(1)
  expect(saved[0]).toMatchObject({
    file_path: "index.tsx",
    content_text: "new",
    is_release_tarball: false,
    npm_pack_output: null,
  })
  expect(saved[0].created_at).not.toBe(oldDate)
  expect(db.getPackageReleaseById(release.package_release_id)).toMatchObject({
    pcb_trace_count: null,
    active_package_build_id: null,
    circuit_json_build_error: null,
    circuit_json_build_error_last_updated_at: null,
    circuit_json_build_is_stale: true,
    ready_to_build: true,
    has_transpiled: false,
    transpilation_is_stale: true,
    transpilation_error: null,
    transpilation_in_progress: false,
    transpilation_started_at: null,
    transpilation_completed_at: null,
    transpilation_logs: [],
    image_generation_is_stale: true,
    image_generation_error: null,
    image_generation_error_last_updated_at: null,
    image_generation_in_progress: false,
    image_generation_started_at: null,
    image_generation_completed_at: null,
    image_generation_logs: [],
  })
  expect(
    db.packages.find((p) => p.package_id === pkg.package_id)?.updated_at,
  ).not.toBe(oldDate)
})

test("archive uploads use organization permissions, not creator ownership", async () => {
  const { jane_axios, axios, db, seed, release, pkg } = await setup()
  const payload = {
    package_release_id: release.package_release_id,
    archive_base64: archive([{ file_path: "index.tsx", content_text: "test" }]),
  }
  // Being the creator does not grant access to another organization's package.
  db.updatePackage(pkg.package_id, {
    creator_account_id: seed.account2.account_id,
  })
  await expect(
    jane_axios.post("/api/package_files/upload_archive", payload),
  ).rejects.toMatchObject({
    status: 403,
    data: {
      error: {
        error_code: "forbidden",
        message:
          "You do not have permission to add files to this package release",
      },
    },
  })
  db.addOrganizationAccount({
    org_id: pkg.owner_org_id,
    account_id: seed.account2.account_id,
    is_owner: false,
  })
  expect(
    (await jane_axios.post("/api/package_files/upload_archive", payload))
      .status,
  ).toBe(200)
  await expect(
    axios.post("/api/package_files/upload_archive", {
      ...payload,
      package_release_id: crypto.randomUUID(),
    }),
  ).rejects.toMatchObject({
    status: 404,
    data: {
      error: {
        error_code: "package_release_not_found",
        message: "Package release not found",
      },
    },
  })
  await expect(
    axios.post("/api/package_files/upload_archive", {
      archive_base64: payload.archive_base64,
      package_name_with_version: "testuser/missing@1.0.0",
    }),
  ).rejects.toMatchObject({ status: 404 })
})
