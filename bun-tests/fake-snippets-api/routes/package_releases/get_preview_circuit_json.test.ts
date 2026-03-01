import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

async function createPackageWithFiles(
  axios: any,
  packageName: string,
  fsMap: Record<string, string>,
) {
  const pkgRes = await axios.post("/api/packages/create", {
    name: packageName,
    description: `Test package ${packageName}`,
  })
  expect(pkgRes.status).toBe(200)

  const relRes = await axios.post("/api/package_releases/create", {
    package_id: pkgRes.data.package.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  expect(relRes.status).toBe(200)

  const releaseId = relRes.data.package_release.package_release_id

  for (const [filePath, content] of Object.entries(fsMap)) {
    const fileRes = await axios.post("/api/package_files/create", {
      package_release_id: releaseId,
      file_path: filePath,
      content_text: content,
    })
    expect(fileRes.status).toBe(200)
  }

  return { package_release_id: releaseId }
}

test("get_preview_circuit_json - previewComponentPath from config", async () => {
  const { axios } = await getTestServer()

  const previewCircuitJson = [{ type: "preview", foo: "bar" }]

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-component-path",
    {
      "tscircuit.config.json": JSON.stringify({
        previewComponentPath: "my-component.tsx",
      }),
      "dist/my-component/circuit.json": JSON.stringify(previewCircuitJson),
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  const body = res.data.preview_circuit_json_response
  expect(body.circuit_json_found).toBe(true)
  expect(body.component_path).toBe("my-component.tsx")
  expect(body.circuit_json).toEqual(previewCircuitJson)
})

test("get_preview_circuit_json - previewComponentPath not found returns false", async () => {
  const { axios } = await getTestServer()

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-missing",
    {
      "tscircuit.config.json": JSON.stringify({
        previewComponentPath: "missing.tsx",
      }),
      "index.tsx": "export default () => null",
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  expect(res.data.preview_circuit_json_response.circuit_json_found).toBe(false)
})

test("get_preview_circuit_json - mainEntrypoint from config", async () => {
  const { axios } = await getTestServer()

  const mainCircuitJson = [{ type: "main-entry" }]

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-main-entry",
    {
      "tscircuit.config.json": JSON.stringify({
        mainEntrypoint: "lib/board.tsx",
      }),
      "dist/lib/board/circuit.json": JSON.stringify(mainCircuitJson),
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  const body = res.data.preview_circuit_json_response
  expect(body.circuit_json_found).toBe(true)
  expect(body.component_path).toBe("lib/board.tsx")
  expect(body.circuit_json).toEqual(mainCircuitJson)
})

test("get_preview_circuit_json - initialComponentPath discovery via src/index.tsx", async () => {
  const { axios } = await getTestServer()

  const circuitJson = [{ type: "src-index" }]

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-src-index",
    {
      "src/index.tsx": "export default () => null",
      "dist/src/index/circuit.json": JSON.stringify(circuitJson),
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  const body = res.data.preview_circuit_json_response
  expect(body.circuit_json_found).toBe(true)
  expect(body.component_path).toBe("src/index.tsx")
  expect(body.circuit_json).toEqual(circuitJson)
})

test("get_preview_circuit_json - nested entrypoint without config", async () => {
  const { axios } = await getTestServer()

  const nestedCircuitJson = [{ type: "nested-main", value: 123 }]

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-nested-main",
    {
      "examples/board/main.tsx": "export default () => null",
      "dist/examples/board/main/circuit.json":
        JSON.stringify(nestedCircuitJson),
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  const body = res.data.preview_circuit_json_response
  expect(body.circuit_json_found).toBe(true)
  expect(body.component_path).toBe("examples/board/main.tsx")
  expect(body.circuit_json).toEqual(nestedCircuitJson)
})

test("get_preview_circuit_json - dist/circuit.json fallback", async () => {
  const { axios } = await getTestServer()

  const distOnlyCircuitJson = [{ type: "dist-only" }]

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-dist-only",
    {
      "dist/circuit.json": JSON.stringify(distOnlyCircuitJson),
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  const body = res.data.preview_circuit_json_response
  expect(body.circuit_json_found).toBe(true)
  expect(body.component_path).toBeUndefined()
  expect(body.circuit_json).toEqual(distOnlyCircuitJson)
})

test("get_preview_circuit_json - dist/index/circuit.json fallback", async () => {
  const { axios } = await getTestServer()

  const indexCircuitJson = [{ type: "dist-index" }]

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-dist-index",
    {
      "dist/index/circuit.json": JSON.stringify(indexCircuitJson),
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  const body = res.data.preview_circuit_json_response
  expect(body.circuit_json_found).toBe(true)
  expect(body.component_path).toBeUndefined()
  expect(body.circuit_json).toEqual(indexCircuitJson)
})

test("get_preview_circuit_json - no circuit json found", async () => {
  const { axios } = await getTestServer()

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-no-circuit",
    {
      "index.tsx": "export default () => null",
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  expect(res.data.preview_circuit_json_response.circuit_json_found).toBe(false)
})

test("get_preview_circuit_json - 404 for non-existent release", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_releases/get_preview_circuit_json", {
      package_release_id: "123e4567-e89b-12d3-a456-426614174000",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
  }
})

test("get_preview_circuit_json - lookup by package_name", async () => {
  const { axios } = await getTestServer()

  const circuitJson = [{ type: "by-name" }]

  await createPackageWithFiles(axios, "testuser/preview-by-name", {
    "index.tsx": "export default () => null",
    "dist/index/circuit.json": JSON.stringify(circuitJson),
  })

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_name: "testuser/preview-by-name", is_latest: true },
  )

  expect(res.status).toBe(200)
  const body = res.data.preview_circuit_json_response
  expect(body.circuit_json_found).toBe(true)
  expect(body.circuit_json).toEqual(circuitJson)
})

test("get_preview_circuit_json - .board.tsx file discovery", async () => {
  const { axios } = await getTestServer()

  const boardCircuitJson = [{ type: "board-file" }]

  const { package_release_id } = await createPackageWithFiles(
    axios,
    "testuser/preview-board-file",
    {
      "my-circuit.board.tsx": "export default () => null",
      "dist/my-circuit.board/circuit.json": JSON.stringify(boardCircuitJson),
    },
  )

  const res = await axios.post(
    "/api/package_releases/get_preview_circuit_json",
    { package_release_id },
  )

  expect(res.status).toBe(200)
  const body = res.data.preview_circuit_json_response
  expect(body.circuit_json_found).toBe(true)
  expect(body.component_path).toBe("my-circuit.board.tsx")
  expect(body.circuit_json).toEqual(boardCircuitJson)
})
