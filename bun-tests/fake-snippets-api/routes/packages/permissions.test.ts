import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("Package permissions - owner should have all permissions", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/test-package",
    unscoped_name: "test-package",
    description: "Test package",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const getResponse = await jane_axios.get("/api/packages/get", {
    params: { package_id: pkg.package_id },
  })

  expect(getResponse.status).toBe(200)
  const packageData = getResponse.data.package
  expect(packageData.user_permissions?.can_read_package).toBe(true)
  expect(packageData.user_permissions?.can_manage_package).toBe(true)
})

test("Package permissions - member with read permission can access private packages", async () => {
  const { jane_axios, axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/member-test-package",
    unscoped_name: "member-test-package",
    description: "Test package for member access",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: true,
  })

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: true,
    can_manage_package: false,
  })

  const memberResponse = await axios.get("/api/packages/get", {
    params: { package_id: pkg.package_id },
  })

  expect(memberResponse.status).toBe(200)
  const packageData = memberResponse.data.package
  expect(packageData.user_permissions?.can_read_package).toBe(true)
  expect(packageData.user_permissions?.can_manage_package).toBe(false)
})

test("Package permissions - member without read permission cannot access private packages", async () => {
  const { jane_axios, axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/no-read-package",
    unscoped_name: "no-read-package",
    description: "Test package for no read access",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: true,
  })

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: false,
    can_manage_package: false,
  })

  try {
    await axios.get("/api/packages/get", {
      params: { package_id: pkg.package_id },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_not_found")
  }
})

test("Package permissions - non-member cannot access private packages", async () => {
  const { axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/private-package",
    unscoped_name: "private-package",
    description: "Private test package",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: true,
  })

  try {
    await axios.get("/api/packages/get", {
      params: { package_id: pkg.package_id },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_not_found")
  }
})

test("Package permissions - non-member can access public packages but cannot manage", async () => {
  const { axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/public-package",
    unscoped_name: "public-package",
    description: "Public test package",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: false,
  })

  const getResponse = await axios.get("/api/packages/get", {
    params: { package_id: pkg.package_id },
  })

  expect(getResponse.status).toBe(200)
  const packageData = getResponse.data.package
  expect(packageData.user_permissions?.can_read_package).toBe(true)
  expect(packageData.user_permissions?.can_manage_package).toBe(false)
})

test("Package management - owners and members with manage permission can update packages", async () => {
  const { jane_axios, axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/update-test-package",
    unscoped_name: "update-test-package",
    description: "Test package for updates",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const updateResponse = await jane_axios.post("/api/packages/update", {
    package_id: pkg.package_id,
    description: "Updated description",
  })
  expect(updateResponse.status).toBe(200)

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: true,
    can_manage_package: true,
  })

  const memberUpdateResponse = await axios.post("/api/packages/update", {
    package_id: pkg.package_id,
    description: "Member updated description",
  })
  expect(memberUpdateResponse.status).toBe(200)
})

test("Package management - members without manage permission cannot update packages", async () => {
  const { jane_axios, axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/readonly-test-package",
    unscoped_name: "readonly-test-package",
    description: "Test package for readonly access",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: true,
    can_manage_package: false,
  })

  try {
    await axios.post("/api/packages/update", {
      package_id: pkg.package_id,
      description: "Unauthorized update",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("forbidden")
  }
})

test("Package management - only owners can delete packages", async () => {
  const { jane_axios, axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/delete-test-package",
    unscoped_name: "delete-test-package",
    description: "Test package for deletion",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  try {
    await axios.post("/api/packages/delete", {
      package_id: pkg.package_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("forbidden")
  }

  const deleteResponse = await jane_axios.post("/api/packages/delete", {
    package_id: pkg.package_id,
  })
  expect(deleteResponse.status).toBe(200)
})

test("Package management - only owners can update AI description", async () => {
  const { jane_axios, axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/ai-test-package",
    unscoped_name: "ai-test-package",
    description: "Test package for AI updates",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  try {
    await axios.post("/api/packages/update_ai_description", {
      package_id: pkg.package_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("unauthorized")
  }

  const updateResponse = await jane_axios.post(
    "/api/packages/update_ai_description",
    {
      package_id: pkg.package_id,
    },
  )
  expect(updateResponse.status).toBe(200)
})

test("Package starring - members can star private packages they can read", async () => {
  const { jane_axios, axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/star-test-package",
    unscoped_name: "star-test-package",
    description: "Test package for starring",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: true,
  })

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const starResponse = await axios.post("/api/packages/add_star", {
    package_id: pkg.package_id,
  })
  expect(starResponse.status).toBe(200)

  const unstarResponse = await axios.post("/api/packages/remove_star", {
    package_id: pkg.package_id,
  })
  expect(unstarResponse.status).toBe(200)
})

test("Package starring - non-members cannot star private packages", async () => {
  const { axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/private-star-package",
    unscoped_name: "private-star-package",
    description: "Private test package for starring",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: true,
  })

  try {
    await axios.post("/api/packages/add_star", {
      package_id: pkg.package_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_not_found")
  }
})

test("Package forking - members can access private packages for forking", async () => {
  const { jane_axios, axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/fork-test-package",
    unscoped_name: "fork-test-package",
    description: "Test package for forking",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: true,
  })

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  try {
    await axios.post("/api/packages/fork", {
      package_id: pkg.package_id,
    })
    throw new Error("Expected request to fail due to missing files")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).not.toBe("package_not_found")
  }
})

test("Package forking - non-members cannot fork private packages", async () => {
  const { axios, db, seed } = await getTestServer()

  const pkg = db.addPackage({
    creator_account_id: seed.account2.account_id,
    owner_org_id: seed.organization.org_id,
    owner_github_username: "jane",
    name: "jane/private-fork-package",
    unscoped_name: "private-fork-package",
    description: "Private test package for forking",
    license: null,
    latest_package_release_id: null,
    latest_version: null,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_private: true,
  })

  try {
    await axios.post("/api/packages/fork", {
      package_id: pkg.package_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_not_found")
  }
})
