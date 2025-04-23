import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("update package release", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package",
    description: "Test Description",
  })
  const packageId = packageResponse.data.package.package_id

  // Create a package release
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseResponse.data.package_release

  // Update the package release
  const response = await axios.post("/api/package_releases/update", {
    package_release_id: release.package_release_id,
    is_locked: true,
    license: "MIT",
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify the release was updated
  const updatedRelease = db.packageReleases.find(
    (pr) => pr.package_release_id === release.package_release_id,
  )
  expect(updatedRelease?.is_locked).toBe(true)
  expect(updatedRelease?.license).toBe("MIT")
})

test("update package release using package_name_with_version", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package-2",
    description: "Test Description",
  })
  const packageName = packageResponse.data.package.name
  const version = "2.0.0"

  // Create a package release
  await axios.post("/api/package_releases/create", {
    package_id: packageResponse.data.package.package_id,
    version,
    is_latest: true,
  })

  // Update using package_name_with_version
  const response = await axios.post("/api/package_releases/update", {
    package_name_with_version: `${packageName}@${version}`,
    is_locked: true,
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify the release was updated
  const updatedRelease = db.packageReleases.find((pr) => pr.version === version)
  expect(updatedRelease?.is_locked).toBe(true)
})

test("update package release - handle is_latest flag", async () => {
  const { axios, db } = await getTestServer()

  // Create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package-3",
    description: "Test Description",
  })
  const packageId = packageResponse.data.package.package_id

  // Create two releases
  const release1 = await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "1.0.0",
    is_latest: true,
  })
  const release2 = await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "2.0.0",
    is_latest: false,
  })

  // Update second release to be latest
  await axios
    .post("/api/package_releases/update", {
      package_release_id: release2.data.package_release.package_release_id,
      is_latest: true,
    })
    .then(() => {
      // Verify first release is no longer latest
      const firstRelease = db.packageReleases.find(
        (pr) =>
          pr.package_release_id ===
          release1.data.package_release.package_release_id,
      )
      expect(firstRelease?.is_latest).toBe(false)
    })

  // Verify second release is now latest
  const secondRelease = db.packageReleases.find(
    (pr) =>
      pr.package_release_id ===
      release2.data.package_release.package_release_id,
  )
  expect(secondRelease?.is_latest).toBe(true)
})

test("update non-existent package release", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_releases/update", {
      package_release_id: "123e4567-e89b-12d3-a456-426614174000",
      is_locked: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})
test("update package release - set is_latest to false when already latest", async () => {
  const { axios, db } = await getTestServer()

  const pkgRes = await axios.post("/api/packages/create", {
    name: "testuser/latest-false-test",
  })
  const pkgId = pkgRes.data.package.package_id
  const relRes = await axios.post("/api/package_releases/create", {
    package_id: pkgId,
    version: "1.0.0",
    is_latest: true,
    is_locked: false,
  })
  const relId = relRes.data.package_release.package_release_id

  const updateRes = await axios.post("/api/package_releases/update", {
    package_release_id: relId,
    is_latest: false,
    is_locked: true,
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)

  const updatedRelease = db.packageReleases.find(
    (pr) => pr.package_release_id === relId,
  )
  expect(updatedRelease?.is_latest).toBe(false)
  expect(updatedRelease?.is_locked).toBe(true)
})

test("update package release - only update non-latest fields", async () => {
  const { axios, db } = await getTestServer()

  const pkgRes = await axios.post("/api/packages/create", {
    name: "testuser/non-latest-update",
  })
  const pkgId = pkgRes.data.package.package_id
  const relRes = await axios.post("/api/package_releases/create", {
    package_id: pkgId,
    version: "1.0.0",
    is_latest: true,
    is_locked: false,
    license: "GPL",
  })
  const relId = relRes.data.package_release.package_release_id

  const updateRes = await axios.post("/api/package_releases/update", {
    package_release_id: relId,
    is_locked: true,
    license: "Apache-2.0",
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)

  const updatedRelease = db.packageReleases.find(
    (pr) => pr.package_release_id === relId,
  )
  expect(updatedRelease?.is_latest).toBe(true)
  expect(updatedRelease?.is_locked).toBe(true)
  expect(updatedRelease?.license).toBe("Apache-2.0")
})

test("update package release - invalid package_name_with_version format", async () => {
  const { axios } = await getTestServer()
  try {
    await axios.post("/api/package_releases/update", {
      package_name_with_version: "invalid-format",
      is_locked: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
  }
})

test("update package release - package_name_with_version not found", async () => {
  const { axios } = await getTestServer()
  try {
    await axios.post("/api/package_releases/update", {
      package_name_with_version: "nonexistent/package@1.0.0",
      is_locked: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
  }
})

test("update package release - version in package_name_with_version not found", async () => {
  const { axios } = await getTestServer()

  await axios.post("/api/packages/create", {
    name: "testuser/no-version-match",
  })

  try {
    await axios.post("/api/package_releases/update", {
      package_name_with_version: "testuser/no-version-match@1.0.0",
      is_locked: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
  }
})

test("update package release - no fields provided", async () => {
  const { axios } = await getTestServer()

  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package-4",
    description: "Test Description",
  })
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: packageResponse.data.package.package_id,
    version: "1.0.0",
  })

  try {
    await axios.post("/api/package_releases/update", {
      package_release_id:
        releaseResponse.data.package_release.package_release_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("no_fields_provided")
    expect(error.data.error.message).toBe("No fields provided to update")
  }
})

test("update package release - set is_latest to false when already latest", async () => {
  const { axios, db } = await getTestServer()

  const pkgRes = await axios.post("/api/packages/create", {
    name: "testuser/latest-false-test",
  })
  const pkgId = pkgRes.data.package.package_id
  const relRes = await axios.post("/api/package_releases/create", {
    package_id: pkgId,
    version: "1.0.0",
    is_latest: true,
    is_locked: false,
  })
  const relId = relRes.data.package_release.package_release_id

  const updateRes = await axios.post("/api/package_releases/update", {
    package_release_id: relId,
    is_latest: false,
    is_locked: true,
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)

  const updatedRelease = db.packageReleases.find(
    (pr) => pr.package_release_id === relId,
  )
  expect(updatedRelease?.is_latest).toBe(false)
  expect(updatedRelease?.is_locked).toBe(true)
})

test("update package release - set another release to latest and update fields", async () => {
  const { axios, db } = await getTestServer()

  const pkgRes = await axios.post("/api/packages/create", {
    name: "testuser/multi-update-test",
  })
  const pkgId = pkgRes.data.package.package_id

  const rel1Res = await axios.post("/api/package_releases/create", {
    package_id: pkgId,
    version: "1.0.0",
    is_latest: true,
    license: "OLD_LICENSE",
  })
  const rel1Id = rel1Res.data.package_release.package_release_id

  const rel2Res = await axios.post("/api/package_releases/create", {
    package_id: pkgId,
    version: "2.0.0",
    is_latest: false,
    is_locked: false,
  })
  const rel2Id = rel2Res.data.package_release.package_release_id

  const updateRes = await axios.post("/api/package_releases/update", {
    package_release_id: rel2Id,
    is_latest: true,
    is_locked: true,
    license: "MIT",
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)

  const updatedRel1 = db.packageReleases.find(
    (pr) => pr.package_release_id === rel1Id,
  )
  expect(updatedRel1?.is_latest).toBe(false)

  const updatedRel2 = db.packageReleases.find(
    (pr) => pr.package_release_id === rel2Id,
  )
  expect(updatedRel2?.is_latest).toBe(true)
  expect(updatedRel2?.is_locked).toBe(true)
  expect(updatedRel2?.license).toBe("MIT")
})

test("update package release - only update non-latest fields", async () => {
  const { axios, db } = await getTestServer()

  const pkgRes = await axios.post("/api/packages/create", {
    name: "testuser/non-latest-update",
  })
  const pkgId = pkgRes.data.package.package_id
  const relRes = await axios.post("/api/package_releases/create", {
    package_id: pkgId,
    version: "1.0.0",
    is_latest: true,
    is_locked: false,
    license: "GPL",
  })
  const relId = relRes.data.package_release.package_release_id

  const updateRes = await axios.post("/api/package_releases/update", {
    package_release_id: relId,
    is_locked: true,
    license: "Apache-2.0",
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)

  const updatedRelease = db.packageReleases.find(
    (pr) => pr.package_release_id === relId,
  )
  expect(updatedRelease?.is_latest).toBe(true)
  expect(updatedRelease?.is_locked).toBe(true)
  expect(updatedRelease?.license).toBe("Apache-2.0")
})

test("update package release - invalid package_name_with_version format", async () => {
  const { axios } = await getTestServer()
  try {
    await axios.post("/api/package_releases/update", {
      package_name_with_version: "invalid-format",
      is_locked: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
  }
})

test("update package release - package_name_with_version not found", async () => {
  const { axios } = await getTestServer()
  try {
    await axios.post("/api/package_releases/update", {
      package_name_with_version: "nonexistent/package@1.0.0",
      is_locked: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
  }
})

test("update package release - version in package_name_with_version not found", async () => {
  const { axios } = await getTestServer()

  await axios.post("/api/packages/create", {
    name: "testuser/no-version-match",
  })

  try {
    await axios.post("/api/package_releases/update", {
      package_name_with_version: "testuser/no-version-match@1.0.0",
      is_locked: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
  }
})
