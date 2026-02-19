import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("org_domains create, get, and list", async () => {
  const { jane_axios } = await getTestServer()

  const createOrgRes = await jane_axios.post("/api/orgs/create", {
    name: "acmeorgdomain",
  })
  const org_id = createOrgRes.data.org.org_id

  const createPackageRes = await jane_axios.post("/api/packages/create", {
    name: "acmeorgdomain/org-domain-package",
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
    fully_qualified_domain_name: "registry.acmeorgdomain.tscircuit.app",
    points_to: "merged_pcm_repositories",
    pcm_repository_name: "Acme Registry",
    linked_packages: [
      {
        points_to: "package_release",
        package_release_id,
      },
    ],
  })

  expect(createDomainRes.status).toBe(200)
  expect(createDomainRes.data.ok).toBe(true)
  expect(createDomainRes.data.org_domain.org_id).toBe(org_id)
  expect(createDomainRes.data.org_domain.points_to).toBe(
    "merged_pcm_repositories",
  )
  expect(createDomainRes.data.org_domain.pcm_repository_name).toBe(
    "Acme Registry",
  )
  expect(createDomainRes.data.org_domain.linked_packages.length).toBe(1)
  expect(createDomainRes.data.org_domain.linked_packages[0].points_to).toBe(
    "package_release",
  )
  expect(
    createDomainRes.data.org_domain.linked_packages[0].package_release_id,
  ).toBe(package_release_id)
  expect(
    createDomainRes.data.org_domain.linked_packages[0]
      .org_domain_linked_package_id,
  ).toBeDefined()

  const org_domain_id = createDomainRes.data.org_domain.org_domain_id

  const getByIdRes = await jane_axios.get(
    `/api/org_domains/get?org_domain_id=${org_domain_id}`,
  )

  expect(getByIdRes.data.ok).toBe(true)
  expect(getByIdRes.data.org_domain.org_domain_id).toBe(org_domain_id)
  expect(getByIdRes.data.org_domain.pcm_repository_name).toBe("Acme Registry")
  expect(getByIdRes.data.org_domain.linked_packages.length).toBe(1)
  expect(getByIdRes.data.org_domain.linked_packages[0].package_release_id).toBe(
    package_release_id,
  )

  const getByFqdnRes = await jane_axios.get(
    "/api/org_domains/get?fully_qualified_domain_name=registry.acmeorgdomain.tscircuit.app",
  )

  expect(getByFqdnRes.data.ok).toBe(true)
  expect(getByFqdnRes.data.org_domain.org_domain_id).toBe(org_domain_id)
  expect(getByFqdnRes.data.org_domain.pcm_repository_name).toBe("Acme Registry")
  expect(getByFqdnRes.data.org_domain.linked_packages.length).toBe(1)

  const listRes = await jane_axios.get(`/api/org_domains/list?org_id=${org_id}`)

  expect(listRes.data.ok).toBe(true)
  expect(listRes.data.org_domains.length).toBeGreaterThanOrEqual(1)
  expect(
    listRes.data.org_domains.some(
      (orgDomain: { org_domain_id: string }) =>
        orgDomain.org_domain_id === org_domain_id,
    ),
  ).toBe(true)

  const listedDomain = listRes.data.org_domains.find(
    (orgDomain: { org_domain_id: string }) =>
      orgDomain.org_domain_id === org_domain_id,
  )

  expect(listedDomain.pcm_repository_name).toBe("Acme Registry")
  expect(listedDomain.linked_packages.length).toBe(1)
  expect(listedDomain.linked_packages[0].package_release_id).toBe(
    package_release_id,
  )
}, 20_000)
