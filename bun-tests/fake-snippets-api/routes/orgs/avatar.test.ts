import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

const AVATAR_CONTENT = "test-avatar-content"

const createAvatarFile = () =>
  new File([Buffer.from(AVATAR_CONTENT)], "avatar.png", {
    type: "image/png",
  })

test("GET /api/orgs/avatar returns image directly when avatar uploaded", async () => {
  const { jane_axios, url } = await getTestServer()

  const {
    data: { org },
  } = await jane_axios.post("/api/orgs/create", {
    name: "avatar-test-org",
  })

  const formData = new FormData()
  formData.append("avatar", createAvatarFile())
  formData.append("org_id", org.org_id)
  await jane_axios.post("/api/orgs/upload_avatar", formData)

  const response = await fetch(
    `${url}/api/orgs/avatar?tscircuit_handle=${org.tscircuit_handle}`,
  )

  expect(response.ok).toBe(true)
  expect(response.headers.get("content-type")).toBe("image/png")
  expect(await response.text()).toBe(AVATAR_CONTENT)
})

test("GET /api/orgs/avatar redirects to github avatar if no uploaded avatar", async () => {
  const { url, seed } = await getTestServer()

  const response = await fetch(
    `${url}/api/orgs/avatar?tscircuit_handle=${seed.organization.tscircuit_handle}`,
    { redirect: "manual" },
  )

  expect(response.status).toBe(302)
  expect(response.headers.get("location")).toBe(
    `https://github.com/${seed.organization.github_handle}.png`,
  )
})

test("GET /api/orgs/avatar includes size param in github redirect", async () => {
  const { url, seed } = await getTestServer()

  const response = await fetch(
    `${url}/api/orgs/avatar?tscircuit_handle=${seed.organization.tscircuit_handle}&size=200`,
    { redirect: "manual" },
  )

  expect(response.status).toBe(302)
  expect(response.headers.get("location")).toBe(
    `https://github.com/${seed.organization.github_handle}.png?s=200`,
  )
})

test("GET /api/orgs/avatar returns 404 for non-existent org", async () => {
  const { url } = await getTestServer()

  const response = await fetch(
    `${url}/api/orgs/avatar?tscircuit_handle=non-existent-org`,
  )

  expect(response.status).toBe(404)
})

test("GET /api/orgs/avatar returns 404 when no avatar available", async () => {
  const { url, db } = await getTestServer()

  db.addOrganization({
    name: "no-avatar-org",
    tscircuit_handle: "no-avatar-org",
    owner_account_id: "test-account",
  })

  const response = await fetch(
    `${url}/api/orgs/avatar?tscircuit_handle=no-avatar-org`,
  )

  expect(response.status).toBe(404)
})
