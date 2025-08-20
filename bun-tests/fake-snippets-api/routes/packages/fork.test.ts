import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("POST /packages/fork - successful fork using package_id", async () => {
  const { axios, jane_axios } = await getTestServer()

  // user creates a package with files
  const sourcePackage = await axios
    .post("/api/packages/create", {
      name: "testuser/test-package-for-fork",
      description: "A package to be forked",
    })
    .then((r: any) => r.data.package)

  // user creates a release
  const sourceRelease = await axios
    .post("/api/package_releases/create", {
      package_id: sourcePackage.package_id,
      version: "1.0.0",
    })
    .then((r: any) => r.data.package_release)

  // user creates a file
  await axios.post("/api/package_files/create", {
    package_release_id: sourceRelease.package_release_id,
    file_path: "index.tsx",
    content_text: "console.log('Hello from original package');",
  })

  // Jane forks the package
  const forkedPackageResponse = await jane_axios.post("/api/packages/fork", {
    package_id: sourcePackage.package_id,
    is_private: false,
  })

  const forkedPackage = forkedPackageResponse.data.package

  // Verify fork was created successfully
  expect(forkedPackage.name).toBe(`jane/${sourcePackage.unscoped_name}`)
  expect(forkedPackage.description).toBe(sourcePackage.description)
  expect(forkedPackage.is_private).toBe(false)

  // List files from the forked package
  const packageFilesResponse = await jane_axios.get("/api/package_files/list", {
    params: {
      package_name: forkedPackage.name,
      use_latest_version: true,
    },
  })

  const package_files = packageFilesResponse.data.package_files

  expect(package_files.length).toBe(1)
  expect(package_files[0].file_path).toBe("index.tsx")
})

test("POST /packages/fork - successful fork using package_name", async () => {
  const { axios, jane_axios } = await getTestServer()

  // Jane creates a package with files
  const sourcePackage = await jane_axios
    .post("/api/packages/create", {
      name: "jane/test-package-for-name-fork",
      description: "A package to be forked by name",
    })
    .then((r: any) => r.data.package)

  // Create a release
  const sourceRelease = await jane_axios
    .post("/api/package_releases/create", {
      package_id: sourcePackage.package_id,
      version: "1.0.0",
    })
    .then((r: any) => r.data.package_release)

  // Create a file
  await jane_axios.post("/api/package_files/create", {
    package_release_id: sourceRelease.package_release_id,
    file_path: "index.tsx",
    content_text: "console.log('Hello from name package');",
  })

  // user forks Jane's package using package_name
  const forkedPackage = await axios
    .post("/api/packages/fork", {
      package_name: "jane/test-package-for-name-fork",
      is_private: true,
    })
    .then((r: any) => r.data.package)

  // Verify fork was created successfully with privacy settings
  expect(forkedPackage.name).toBe(`testuser/${sourcePackage.unscoped_name}`)
  expect(forkedPackage.is_private).toBe(true)
  expect(forkedPackage.is_unlisted).toBe(true) // Should be unlisted since it's private
})

test("POST /packages/fork - error when package not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/packages/fork", {
      package_id: "00000000-0000-0000-0000-000000000000", // Non-existent ID
    })
    // If it doesn't throw, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_not_found")
  }
})

test("POST /packages/fork - error when trying to fork own package", async () => {
  const { jane_axios } = await getTestServer()

  const sourcePackage = await jane_axios
    .post("/api/packages/create", {
      name: "jane/test-package-for-fork",
      description: "A package to be forked",
    })
    .then((r: any) => r.data.package)

  try {
    await jane_axios.post("/api/packages/fork", {
      package_id: sourcePackage.package_id,
    })
    // If it doesn't throw, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("cannot_fork_own_package")
  }
})
