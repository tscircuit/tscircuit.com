import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { Package } from "fake-snippets-api/lib/db/schema"

test("list packages", async () => {
  const { axios } = await getTestServer()

  // Create test packages using the API
  const packages = [
    {
      name: "Package1",
      description: "Description 1",
      ai_description: "AI Description 1",
    },
    {
      name: "Package2",
      description: "Description 2",
      ai_description: "AI Description 2",
    },
    {
      name: "Package3",
      description: "Description 3",
      ai_description: "AI Description 3",
    },
  ]

  // Create packages using the API
  const createdPackages = []
  for (const pkg of packages) {
    const response = await axios.post("/api/packages/create", pkg, {
      headers: {
        Authorization: "Bearer 1234",
      },
    })
    createdPackages.push(response.data.package)
  }

  // Test with no parameters (should return at least our created packages)
  const { data: allData } = await axios.get("/api/packages/list")
  expect(allData.ok).toBe(true)

  const responseContainsAllCreatedPackages = createdPackages.every((pkg) =>
    allData.packages.some((p: Package) => p.package_id === pkg.package_id),
  )
  expect(responseContainsAllCreatedPackages).toBe(true)

  // Test with owner_github_username parameter (all packages created by testuser)
  const { data: user1Data } = await axios.get("/api/packages/list", {
    params: { owner_github_username: "testuser" },
  })
  // Verify all our created packages are in this filtered response
  expect(
    createdPackages.every((pkg) =>
      user1Data.packages.some((p: Package) => p.package_id === pkg.package_id),
    ),
  ).toBe(true)

  // Verify all packages have the correct owner
  expect(
    user1Data.packages.every(
      (pkg: Package) => pkg.owner_github_username === "testuser",
    ),
  ).toBe(true)

  // Test with creator_account_id parameter
  const { data: creator1Data } = await axios.get("/api/packages/list", {
    params: { creator_account_id: "account-1234" }, // Default account ID for test auth
  })
  // Verify all our created packages are in this filtered response
  expect(
    createdPackages.every((pkg) =>
      creator1Data.packages.some(
        (p: Package) => p.package_id === pkg.package_id,
      ),
    ),
  ).toBe(true)

  // Verify all packages have the correct creator
  expect(
    creator1Data.packages.every(
      (pkg: Package) => pkg.creator_account_id === "account-1234",
    ),
  ).toBe(true)

  // Test with name parameter
  const { data: nameData } = await axios.get("/api/packages/list", {
    params: {
      name: "Package1",
      owner_github_username: "testuser",
    },
  })
  expect(nameData.packages.length).toBeGreaterThanOrEqual(1)
  expect(
    nameData.packages.some((pkg: Package) => pkg.name === "Package1"),
  ).toBe(true)

  // Test with non-existent owner
  const { data: nonExistentData } = await axios.get("/api/packages/list", {
    params: { owner_github_username: "nonexistentuser" },
  })
  expect(nonExistentData.packages).toHaveLength(0)

  // Test with authenticated request
  const { data: authData } = await axios.get("/api/packages/list", {
    headers: {
      Authorization: "Bearer 1234",
    },
  })
  // Verify all our created packages are in this authenticated response
  expect(
    createdPackages.every((pkg) =>
      authData.packages.some((p: Package) => p.package_id === pkg.package_id),
    ),
  ).toBe(true)
})

test("list packages with is_writable filter", async () => {
  const { axios } = await getTestServer()

  // Create a package owned by the authenticated user
  await axios.post(
    "/api/packages/create",
    {
      name: "OwnedPackage",
      description: "Package owned by testuser",
    },
    {
      headers: {
        Authorization: "Bearer 1234", // Auth token for testuser
      },
    },
  )

  // Test with is_writable filter (requires auth)
  const { data: writableData } = await axios.get("/api/packages/list", {
    params: { is_writable: true },
    headers: {
      Authorization: "Bearer 1234",
    },
  })
  expect(writableData.packages).toHaveLength(1)
  expect(writableData.packages[0].name).toBe("OwnedPackage")
})
