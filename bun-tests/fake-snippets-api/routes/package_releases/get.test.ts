import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/package_releases/get - should return package release by package_release_id", async () => {
  const { axios } = await getTestServer()

  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/package-1",
    description: "A test package",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  const getResponse = await axios.post("/api/package_releases/get", {
    package_release_id: createdRelease.package_release_id,
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_release).toEqual(createdRelease)
})

test("POST /api/package_releases/get - should return 404 if package release not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_releases/get", {
      package_release_id: "123e4567-e89b-12d3-a456-426614174000", // valid UUID format
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("POST /api/package_releases/get - should find release by package_name_with_version", async () => {
  const { axios } = await getTestServer()

  // First create a package with valid name format
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/package-2",
    description: "Another test package",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release
  const version = "2.0.0"
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_name_with_version: `${createdPackage.name}@${version}`,
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  const listResponse = await axios.post("/api/package_releases/list", {
    package_name: createdPackage.name,
  })

  // Get the release using package_name_with_version
  const getResponse = await axios.post("/api/package_releases/get", {
    package_release_id: createdRelease.package_release_id,
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_release).toEqual(createdRelease)
})

test("POST /api/package_releases/get - should return circuit_json_build_error if it exists", async () => {
  const { axios, seed } = await getTestServer()

  // First create a package with valid name format
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/package-3",
    description: "Another test package",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release with a circuit_json_build_error
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  // Get the release
  const getResponse = await axios.post("/api/package_releases/get", {
    package_release_id: createdRelease.package_release_id,
  })
  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_release.circuit_json_build_error).toBe(null)
})

test("POST /api/package_releases/get?include_logs=true - should return include_logs if it exists", async () => {
  const { axios } = await getTestServer()

  // First create a package with valid name format
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/package-4",
    description: "Another test package",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release with a circuit_json_build_error
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  // Get the release
  const getResponse = await axios.post(
    "/api/package_releases/get",
    {
      package_release_id: createdRelease.package_release_id,
    },
    {
      params: { include_logs: true },
    },
  )
  expect(getResponse.status).toBe(200)

  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_release.transpilation_logs).toEqual([])
  expect(responseBody.package_release.circuit_json_build_logs).toEqual([])
})

test("POST /api/package_releases/get?include_ai_review=true returns latest review", async () => {
  const { axios, seed } = await getTestServer()

  const createRes = await axios.post("/api/ai_reviews/create", {
    package_release_id: seed.packageRelease.package_release_id,
  })
  const aiReviewId = createRes.data.ai_review.ai_review_id

  await axios.post("/api/_fake/ai_reviews/process_review", {
    ai_review_id: aiReviewId,
  })

  const getRes = await axios.post(
    "/api/package_releases/get",
    { package_release_id: seed.packageRelease.package_release_id },
    { params: { include_ai_review: true } },
  )

  expect(getRes.status).toBe(200)
  expect(getRes.data.package_release.ai_review_text).toBe(
    "Placeholder AI Review",
  )
  expect(getRes.data.package_release.ai_review_completed_at).not.toBeNull()
})

test("POST /api/package_releases/get - returns pr_number, pr_title, branch_name, is_pr_preview", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-pr-details",
    description: "A test package for PR details",
  })
  expect(packageRes.status).toBe(200)

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: packageRes.data.package.package_id,
    version: "1.0.0",
  })
  expect(releaseRes.status).toBe(200)

  const packageReleaseId = releaseRes.data.package_release.package_release_id
  const existingRelease = db.getPackageReleaseById(packageReleaseId)!

  db.updatePackageRelease({
    ...existingRelease,
    pr_number: 42,
    pr_title: "feat: add new feature",
    branch_name: "feature/new-feature",
    is_pr_preview: true,
  })

  const getRes = await axios.post("/api/package_releases/get", {
    package_release_id: packageReleaseId,
  })

  expect(getRes.status).toBe(200)
  expect(getRes.data.ok).toBe(true)
  expect(getRes.data.package_release.github_pr_number).toBe(42)
  expect(getRes.data.package_release.github_pr_title).toBe(
    "feat: add new feature",
  )
  expect(getRes.data.package_release.github_branch_name).toBe(
    "feature/new-feature",
  )
  expect(getRes.data.package_release.is_pr_preview).toBe(true)
})

test("POST /api/package_releases/get - falls back to valid transpiled release when latest is broken #4204", async () => {
  const { axios, db } = await getTestServer()

  const pkgRes = await axios.post("/api/packages/create", {
    name: "testuser/fallback-valid-release",
    description: "A package with a broken latest release",
  })
  expect(pkgRes.status).toBe(200)

  // Older valid release v0.1.0
  const rel1 = await axios.post("/api/package_releases/create", {
    package_id: pkgRes.data.package.package_id,
    version: "0.1.0",
    is_latest: false,
  })
  expect(rel1.status).toBe(200)

  const rel1Id = rel1.data.package_release.package_release_id
  const rel1Obj = db.getPackageReleaseById(rel1Id)!
  db.updatePackageRelease({
    ...rel1Obj,
    has_transpiled: true,
  })

  // Broken latest release v0.2.0
  const rel2 = await axios.post("/api/package_releases/create", {
    package_id: pkgRes.data.package.package_id,
    version: "0.2.0",
    is_latest: true,
  })
  expect(rel2.status).toBe(200)

  const rel2Id = rel2.data.package_release.package_release_id
  const rel2Obj = db.getPackageReleaseById(rel2Id)!
  db.updatePackageRelease({
    ...rel2Obj,
    circuit_json_build_error: "Transpile failed",
    has_transpiled: false,
  })

  const getRes = await axios.post("/api/package_releases/get", {
    package_name: "testuser/fallback-valid-release",
    is_latest: true,
  })

  expect(getRes.status).toBe(200)
  expect(getRes.data.ok).toBe(true)
  expect(getRes.data.package_release.version).toBe("0.1.0")
})
