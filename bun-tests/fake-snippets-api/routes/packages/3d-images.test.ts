import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import md5 from "md5"

test("get 3d png of a package", async () => {
  const { axios } = await getTestServer()

  const pkg = await axios.post("/api/packages/create", {
    name: "testuser/Test3dPackage",
    description: "Test 3D Description",
  })
  const pkgRelease = await axios.post("/api/package_releases/create", {
    package_id: pkg.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  const circuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_0",
      center: { x: 0, y: 0 },
      thickness: 1.4,
      num_layers: 4,
      width: 30,
      height: 30,
    },
  ]
  await axios.post("/api/package_files/create", {
    package_release_id: pkgRelease.data.package_release.package_release_id,
    file_path: "circuit.json",
    content_text: JSON.stringify(circuitJson),
  })

  const files = await axios.get("/api/package_files/list", {
    params: {
      package_release_id: pkgRelease.data.package_release.package_release_id,
    },
  })
  const fsMap = new Map<string, string>()
  for (const file of files.data.package_files) {
    fsMap.set(file.file_path, file.content_text)
  }
  const fsSha = `md5-${md5(JSON.stringify(fsMap))}`
  await axios.post("/api/package_releases/update", {
    package_release_id: pkgRelease.data.package_release.package_release_id,
    fs_sha: fsSha,
  })

  const response = await axios.get(
    `/api/packages/images/testuser/${pkg.data.package.unscoped_name}/3d.png`,
    { params: { fs_sha: fsSha } },
  )

  expect(response.status).toBe(200)
  expect(response.headers.get("content-type")).toContain("image/png")

  const svgResponse = await axios.get(
    `/api/packages/images/testuser/${pkg.data.package.unscoped_name}/3d.svg`,
    { params: { fs_sha: fsSha }, validateStatus: () => true },
  )
  expect(svgResponse.status).toBe(400)
})
