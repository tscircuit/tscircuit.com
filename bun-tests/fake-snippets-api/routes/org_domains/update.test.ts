import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("org_domains update pcm_repository_name", async () => {
  const { jane_axios } = await getTestServer()

  const createOrgRes = await jane_axios.post("/api/orgs/create", {
    name: "acmeorgdomainupdate",
  })
  const org_id = createOrgRes.data.org.org_id

  const createDomainRes = await jane_axios.post("/api/org_domains/create", {
    org_id,
    fully_qualified_domain_name:
      "registry-update.acmeorgdomainupdate.tscircuit.app",
    points_to: "merged_pcm_repositories",
    pcm_repository_name: "Old Name",
  })

  const org_domain_id = createDomainRes.data.org_domain.org_domain_id

  const updateRes = await jane_axios.post("/api/org_domains/update", {
    org_domain_id,
    pcm_repository_name: "New PCM Name",
  })

  expect(updateRes.status).toBe(200)
  expect(updateRes.data.ok).toBe(true)
  expect(updateRes.data.org_domain.org_domain_id).toBe(org_domain_id)
  expect(updateRes.data.org_domain.pcm_repository_name).toBe("New PCM Name")

  const getRes = await jane_axios.get(
    `/api/org_domains/get?org_domain_id=${org_domain_id}`,
  )
  expect(getRes.data.org_domain.pcm_repository_name).toBe("New PCM Name")
}, 20_000)
