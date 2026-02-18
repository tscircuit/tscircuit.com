import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("org_domains add_linked_package and remove_linked_package", async () => {
  const { jane_axios } = await getTestServer()

  const createOrgRes = await jane_axios.post("/api/orgs/create", {
    name: "acmelinkedpackages",
  })
  const org_id = createOrgRes.data.org.org_id

  const createPackageRes = await jane_axios.post("/api/packages/create", {
    name: "acmelinkedpackages/linked-package",
  })
  const package_id = createPackageRes.data.package.package_id

  const createReleaseRes = await jane_axios.post(
    "/api/package_releases/create",
    {
      package_id,
      version: "0.0.1",
    },
  )
  const package_release_id =
    createReleaseRes.data.package_release.package_release_id

  const createDomainRes = await jane_axios.post("/api/org_domains/create", {
    org_id,
    fully_qualified_domain_name: "packages.acmelinkedpackages.tscircuit.app",
    points_to: "merged_pcm_repositories",
  })
  const org_domain_id = createDomainRes.data.org_domain.org_domain_id

  const addRes = await jane_axios.post("/api/org_domains/add_linked_package", {
    org_domain_id,
    points_to: "package_release",
    package_release_id,
  })

  expect(addRes.data.ok).toBe(true)
  expect(addRes.data.org_domain.org_domain_id).toBe(org_domain_id)
  expect(addRes.data.org_domain.linked_packages.length).toBe(1)
  expect(addRes.data.org_domain.linked_packages[0].package_release_id).toBe(
    package_release_id,
  )

  const org_domain_linked_package_id =
    addRes.data.org_domain.linked_packages[0].org_domain_linked_package_id

  const removeRes = await jane_axios.post(
    "/api/org_domains/remove_linked_package",
    {
      org_domain_id,
      org_domain_linked_package_id,
    },
  )

  expect(removeRes.data.ok).toBe(true)
  expect(removeRes.data.org_domain.org_domain_id).toBe(org_domain_id)
  expect(removeRes.data.org_domain.linked_packages.length).toBe(0)
}, 20_000)
