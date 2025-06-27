import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import md5 from "md5"
test("get schematic svg of a package", async () => {
  const { axios, db } = await getTestServer()

  // create a package
  const pkg = await axios.post("/api/packages/create", {
    name: "testuser/TestPackage",
    description: "Test Description",
  })

  // create a package release
  const pkg_release = await axios.post("/api/package_releases/create", {
    package_id: pkg.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })

  const circuit_json = [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_0",
      center: {
        x: 0,
        y: 0,
      },
      thickness: 1.4,
      num_layers: 4,
      width: 30,
      height: 30,
    },
  ]
  // create a package file
  const pkg_file = await axios.post("/api/package_files/create", {
    package_release_id: pkg_release.data.package_release.package_release_id,
    file_path: "circuit.json",
    content_text: JSON.stringify(circuit_json),
  })

  // create fsMap by getting all the files in the package with the file_path and content_text
  const fsMap = new Map<string, string>()
  // list all the files in the package
  const files = await axios.post("/api/package_files/list", {
    package_release_id: pkg_release.data.package_release.package_release_id,
  })
  for (const file of files.data.package_files) {
    fsMap.set(file.file_path, file.content_text)
  }

  const fsMapHash = md5(JSON.stringify(fsMap))

  // update the package release with the fsMapHash
  await axios.post("/api/package_releases/update", {
    package_release_id: pkg_release.data.package_release.package_release_id,
    fs_sha: `md5-${fsMapHash}`,
  })

  const response = await axios.get(
    `/api/packages/images/${pkg.data.package.owner_github_username}/${pkg.data.package.unscoped_name}/schematic.svg`,
    {
      params: {
        fs_sha: `md5-${fsMapHash}`,
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data).toContain("<svg")
})
