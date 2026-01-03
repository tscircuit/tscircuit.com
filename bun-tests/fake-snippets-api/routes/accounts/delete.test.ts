import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("DELETE /api/accounts/delete - should delete authenticated account", async () => {
  const { axios, db, seed } = await getTestServer()

  const response = await axios.delete("/api/accounts/delete")

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  const state = db.getState()
  const accountAfter = state.accounts.find(
    (a) => a.account_id === seed.account.account_id,
  )
  expect(accountAfter).toBeUndefined()
})

test("DELETE /api/accounts/delete - should return 404 if account not found", async () => {
  const { unauthenticatedAxios } = await getTestServer()

  try {
    await unauthenticatedAxios.delete("/api/accounts/delete")
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("account_not_found")
    expect(error.data.error.message).toBe("Account not found")
  }
})

test("DELETE /api/accounts/delete - should delete personal org and packages", async () => {
  const { axios, db, seed } = await getTestServer()

  const createResponse = await axios.post("/api/packages/create", {
    name: "testuser/DeleteTestPackage",
    description: "Package to be deleted with account",
  })
  expect(createResponse.status).toBe(200)
  const createdPackage = createResponse.data.package

  const stateBefore = db.getState()
  const personalOrg = stateBefore.organizations.find(
    (org) =>
      org.owner_account_id === seed.account.account_id &&
      org.is_personal_org === true,
  )
  expect(personalOrg).toBeDefined()

  const packagesBefore = stateBefore.packages.filter(
    (pkg) => pkg.owner_org_id === personalOrg!.org_id,
  )
  expect(packagesBefore.length).toBeGreaterThan(0)

  const deleteResponse = await axios.delete("/api/accounts/delete")
  expect(deleteResponse.status).toBe(200)
  expect(deleteResponse.data.ok).toBe(true)

  const stateAfter = db.getState()

  const accountAfter = stateAfter.accounts.find(
    (a) => a.account_id === seed.account.account_id,
  )
  expect(accountAfter).toBeUndefined()

  const personalOrgAfter = stateAfter.organizations.find(
    (org) => org.org_id === personalOrg!.org_id,
  )
  expect(personalOrgAfter).toBeUndefined()

  const packagesAfter = stateAfter.packages.filter(
    (pkg) => pkg.owner_org_id === personalOrg!.org_id,
  )
  expect(packagesAfter.length).toBe(0)

  const orgAccountsAfter = stateAfter.orgAccounts.filter(
    (oa) => oa.org_id === personalOrg!.org_id,
  )
  expect(orgAccountsAfter.length).toBe(0)

  const sessionsAfter = stateAfter.sessions.filter(
    (s) => s.account_id === seed.account.account_id,
  )
  expect(sessionsAfter.length).toBe(0)
})

test("DELETE /api/accounts/delete - should delete package releases and files", async () => {
  const { axios, db, seed } = await getTestServer()

  const stateBefore = db.getState()
  const personalOrg = stateBefore.organizations.find(
    (org) =>
      org.owner_account_id === seed.account.account_id &&
      org.is_personal_org === true,
  )
  expect(personalOrg).toBeDefined()

  const pkg = db.addPackage({
    name: "testuser/pkg-with-release",
    unscoped_name: "pkg-with-release",
    description: "Package with release to test deletion",
    creator_account_id: seed.account.account_id,
    owner_org_id: personalOrg!.org_id,
    latest_package_release_id: null,
    latest_version: null,
    license: null,
    website: null,
    is_source_from_github: false,
    latest_package_release_fs_sha: null,
    star_count: 0,
    ai_description: null,
    ai_usage_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const release = db.addPackageRelease({
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
    is_locked: false,
    created_at: new Date().toISOString(),
  })

  db.addPackageFile({
    package_release_id: release.package_release_id,
    file_path: "index.tsx",
    content_text: "export const Test = () => <resistor />",
    created_at: new Date().toISOString(),
  })

  const stateWithPkg = db.getState()
  const packageIds = stateWithPkg.packages
    .filter((p) => p.owner_org_id === personalOrg!.org_id)
    .map((p) => p.package_id)
  expect(packageIds.length).toBeGreaterThan(0)

  const releaseIds = stateWithPkg.packageReleases
    .filter((rel) => packageIds.includes(rel.package_id))
    .map((rel) => rel.package_release_id)
  expect(releaseIds.length).toBeGreaterThan(0)

  const filesBefore = stateWithPkg.packageFiles.filter((f) =>
    releaseIds.includes(f.package_release_id),
  )
  expect(filesBefore.length).toBeGreaterThan(0)

  const deleteResponse = await axios.delete("/api/accounts/delete")
  expect(deleteResponse.status).toBe(200)

  const stateAfter = db.getState()

  const packagesAfter = stateAfter.packages.filter(
    (p) => p.owner_org_id === personalOrg!.org_id,
  )
  expect(packagesAfter.length).toBe(0)

  const releasesAfter = stateAfter.packageReleases.filter((rel) =>
    releaseIds.includes(rel.package_release_id),
  )
  expect(releasesAfter.length).toBe(0)

  const filesAfter = stateAfter.packageFiles.filter((f) =>
    releaseIds.includes(f.package_release_id),
  )
  expect(filesAfter.length).toBe(0)
})
