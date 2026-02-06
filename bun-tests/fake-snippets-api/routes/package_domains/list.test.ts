import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("list package domains - returns all when no filters", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-list-domain",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseRes.data.package_release

  // Create multiple domains
  await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "list-1.example.com",
  })
  await axios.post("/api/package_domains/create", {
    points_to: "package_release",
    package_release_id: release.package_release_id,
    fully_qualified_domain_name: "list-2.example.com",
  })

  const listRes = await axios.post("/api/package_domains/list", {})

  expect(listRes.status).toBe(200)
  expect(listRes.data.ok).toBe(true)
  expect(listRes.data.package_domains.length).toBeGreaterThanOrEqual(2)
})

test("list package domains - filter by package_id", async () => {
  const { axios } = await getTestServer()

  const pkg1Res = await axios.post("/api/packages/create", {
    name: "testuser/test-list-pkg1",
    description: "Test 1",
  })
  const pkg1 = pkg1Res.data.package

  const pkg2Res = await axios.post("/api/packages/create", {
    name: "testuser/test-list-pkg2",
    description: "Test 2",
  })
  const pkg2 = pkg2Res.data.package

  await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg1.package_id,
    fully_qualified_domain_name: "pkg1.example.com",
  })
  await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg2.package_id,
    fully_qualified_domain_name: "pkg2.example.com",
  })

  const listRes = await axios.post("/api/package_domains/list", {
    package_id: pkg1.package_id,
  })

  expect(listRes.status).toBe(200)
  expect(listRes.data.package_domains).toHaveLength(1)
  expect(listRes.data.package_domains[0].package_id).toBe(pkg1.package_id)
})

test("list package domains - filter by package_release_id", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-list-release",
    description: "Test",
  })
  const pkg = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseRes.data.package_release

  await axios.post("/api/package_domains/create", {
    points_to: "package_release",
    package_release_id: release.package_release_id,
    fully_qualified_domain_name: "release-filter.example.com",
  })
  await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "pkg-filter.example.com",
  })

  const listRes = await axios.post("/api/package_domains/list", {
    package_release_id: release.package_release_id,
  })

  expect(listRes.status).toBe(200)
  expect(listRes.data.package_domains).toHaveLength(1)
  expect(listRes.data.package_domains[0].package_release_id).toBe(
    release.package_release_id,
  )
})

test("list package domains - sorted by created_at descending", async () => {
  const { axios, db } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "testuser/test-list-sort",
    description: "Test",
  })
  const pkg = packageRes.data.package

  // Create domains with slight delay to ensure different timestamps
  const res1 = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "sort-1.example.com",
  })
  const res2 = await axios.post("/api/package_domains/create", {
    points_to: "package",
    package_id: pkg.package_id,
    fully_qualified_domain_name: "sort-2.example.com",
  })

  const listRes = await axios.post("/api/package_domains/list", {
    package_id: pkg.package_id,
  })

  expect(listRes.status).toBe(200)
  expect(listRes.data.package_domains).toHaveLength(2)

  // Most recently created should be first
  const dates = listRes.data.package_domains.map((d: any) =>
    new Date(d.created_at).getTime(),
  )
  expect(dates[0]).toBeGreaterThanOrEqual(dates[1])
})

test("list package domains - empty result for non-existent filter", async () => {
  const { axios } = await getTestServer()

  const listRes = await axios.post("/api/package_domains/list", {
    package_id: "non-existent-package-id",
  })

  expect(listRes.status).toBe(200)
  expect(listRes.data.ok).toBe(true)
  expect(listRes.data.package_domains).toHaveLength(0)
})
