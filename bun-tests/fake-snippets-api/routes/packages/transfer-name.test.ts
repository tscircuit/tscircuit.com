import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test(
  "POST /packages/transfer - updates package name with new owner handle",
  async () => {
    const { jane_axios, seed } = await getTestServer()

    const createResponse = await jane_axios.post("/api/packages/create", {
      name: "jane/transfer-name-test",
      description: "Package to test name transfer",
    })

    const packageId = createResponse.data.package.package_id

    expect(createResponse.data.package.name).toBe("jane/transfer-name-test")

    const transferResponse = await jane_axios.post("/api/packages/transfer", {
      package_id: packageId,
      target_org_id: seed.organization.org_id,
    })

    expect(transferResponse.status).toBe(200)
    expect(transferResponse.data.package.owner_org_id).toBe(
      seed.organization.org_id,
    )
    expect(transferResponse.data.package.name).toBe(
      "janes-organization/transfer-name-test",
    )
  },
  { timeout: 20000 },
)
