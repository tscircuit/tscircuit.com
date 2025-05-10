import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { generateCircuitJson } from "bun-tests/fake-snippets-api/fixtures/get-circuit-json"
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

  const circuit_json = await generateCircuitJson({
    code: `
import { A555Timer } from "@tsci/seveibar.a555timer"

export default () => (
  <board width="10mm" height="10mm">
    <A555Timer name="U1" />
  </board>
)`.trim(),
    type: "board",
    compiled_js: `
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.A555Timer = void 0;
  const A555Timer = ({ name }) => /*#__PURE__*/React.createElement("chip", {
    name: name,
    footprint: "dip8"
  });
  exports.A555Timer = A555Timer;
  `.trim(),
  })
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
    // get the file content
    const file_content = await axios.post("/api/package_files/get", {
      package_file_id: file.package_file_id,
    })
    fsMap.set(file.file_path, file_content.data.package_file.content_text)
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
