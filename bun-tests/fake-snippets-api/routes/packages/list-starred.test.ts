import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("starred_by filters before limit and keeps viewer metadata", async () => {
  const { axios, jane_axios, unauthenticatedAxios, db, seed } =
    await getTestServer()
  await axios.post("/api/packages/create", { name: "testuser/unstarred" })
  const {
    data: { package: pkg },
  } = await axios.post("/api/packages/create", {
    name: "testuser/starred",
  })
  await jane_axios.post("/api/packages/add_star", {
    package_id: pkg.package_id,
  })

  const { data } = await axios.post("/api/packages/list", {
    starred_by: "JANE",
    limit: 1,
  })
  expect(data.packages.map((p: any) => p.package_id)).toEqual([pkg.package_id])
  expect(data.packages[0].starred_at).toBeNull()

  await axios.post("/api/packages/add_star", { package_id: pkg.package_id })
  const viewerStar = db.accountPackages.find(
    (ap) =>
      ap.package_id === pkg.package_id &&
      ap.account_id === seed.account.account_id,
  )!
  viewerStar.starred_at = "2024-01-01T00:00:00.000Z"
  viewerStar.updated_at = "2025-01-01T00:00:00.000Z"
  const listed = await axios.post("/api/packages/list", { starred_by: "jane" })
  expect(listed.data.packages[0].starred_at).toBe(viewerStar.starred_at)

  await axios.post("/api/packages/remove_star", { package_id: pkg.package_id })
  const afterUnstar = await axios.post("/api/packages/list", {
    starred_by: "jane",
  })
  expect(afterUnstar.data.packages[0].starred_at).toBe(viewerStar.starred_at)
  const ownStars = await axios.post("/api/packages/list", {
    starred_by: "testuser",
  })
  expect(ownStars.data.packages).toEqual([])

  await axios.post("/api/packages/add_star", { package_id: pkg.package_id })
  expect(viewerStar.starred_at).not.toBe("2024-01-01T00:00:00.000Z")

  const anonymous = await unauthenticatedAxios.post("/api/packages/list", {
    starred_by: "jane",
    owner_tscircuit_handle: "testuser",
  })
  expect(anonymous.data.packages).toHaveLength(1)
  expect(anonymous.data.packages[0].starred_at).toBeNull()
  const unknown = await axios.post("/api/packages/list", {
    starred_by: "unknown",
  })
  expect(unknown.data.packages).toEqual([])
})

test("anonymous starred_by alone is rejected like production", async () => {
  const { unauthenticatedAxios } = await getTestServer()
  for (const method of ["get", "post"] as const) {
    try {
      await unauthenticatedAxios[method](
        "/api/packages/list",
        method === "get"
          ? { params: { starred_by: "testuser" } }
          : { starred_by: "testuser" },
      )
      throw new Error("Expected the request to fail")
    } catch (error: any) {
      expect(error.status).toBe(400)
    }
  }
})
