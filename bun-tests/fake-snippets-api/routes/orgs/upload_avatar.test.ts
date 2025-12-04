import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

const AVATAR_CONTENT = "test-avatar-content"

const createAvatarFile = () =>
  new File([Buffer.from(AVATAR_CONTENT)], "avatar.png", {
    type: "image/png",
  })

test("POST /api/orgs/upload_avatar uploads avatar and updates org", async () => {
  const server = await getTestServer()

  const {
    data: { org },
  } = await server.jane_axios.post("/api/orgs/create", {
    name: "avatar-org",
  })

  const formData = new FormData()
  formData.append("avatar", createAvatarFile())
  formData.append("org_id", org.org_id)

  const {
    data: { org: updatedOrg },
  } = await server.jane_axios.post("/api/orgs/upload_avatar", formData)

  expect(updatedOrg.avatar_url?.startsWith("data:image/png;base64,")).toBe(true)

  const avatarResponse = await fetch(updatedOrg.avatar_url || "")
  expect(await avatarResponse.text()).toBe(AVATAR_CONTENT)

  const {
    data: { org: fetched },
  } = await server.jane_axios.get(`/api/orgs/get?org_id=${org.org_id}`)

  expect(fetched.avatar_url).toBe(updatedOrg.avatar_url)
})
