import { test } from "node:test"
import assert from "node:assert/strict"
import { fetchReleasePreviewDiagnostics } from "../server/release-preview-diagnostics.js"
import {
  renderPackagePageContent,
  parsePackagePageRoute,
} from "../server/package-page-ssr.js"

const route = parsePackagePageRoute(
  "/alice/board/releases/release-1/preview?tab=errors#file=circuit.json",
)
const packageInfo = {
  package_id: "package-1",
  name: "alice/board",
  is_private: false,
  is_public: true,
}
const packageRelease = {
  package_id: "package-1",
  package_release_id: "release-1",
  version: "1.0.0",
  latest_package_build_id: "build-1",
}
const warning = {
  type: "source_pin_missing_trace_warning",
  warning_type: "source_pin_missing_trace_warning",
  message: "Check <U1> & pin 3",
  source_port_id: "port-3",
}
const error = {
  type: "pcb_trace_error",
  error_type: "pcb_trace_error",
  message: "Unconnected net",
}
const previewResponse = {
  preview_circuit_json_response: {
    circuit_json_found: true,
    component_path: "index.circuit.tsx",
    circuit_json: [null, { type: "pcb_board" }, warning, error],
  },
}

const fetchOptions = {
  route,
  packageInfo,
  packageRelease,
  registryUrl: "https://api.tscircuit.com",
}
const pageData = {
  route,
  packageInfo,
  packageRelease,
  packageFiles: [],
  packageReleases: [],
  packageBuilds: [],
}

test("public preview uses the selected release and includes errors and warnings", async () => {
  const preview = await fetchReleasePreviewDiagnostics({
    ...fetchOptions,
    fetchJson: async (url) => {
      assert.equal(url.pathname, "/package_releases/get_preview_circuit_json")
      assert.equal(url.searchParams.get("package_release_id"), "release-1")
      return previewResponse
    },
  })
  assert.deepEqual(preview.diagnostics, [warning, error])
  const html = renderPackagePageContent({
    ...pageData,
    previewDiagnostics: preview,
    packageBuild: { circuit_json_build_logs: [{ message: "Built <board>" }] },
  })
  assert.ok(html.includes("Circuit errors and warnings (2)"))
  assert.ok(html.includes("Check &lt;U1&gt; &amp; pin 3"))
  assert.ok(html.includes("port-3"))
  assert.ok(html.includes("index.circuit.tsx"))
  assert.ok(html.includes("Built &lt;board&gt;"))
  assert.ok(!html.includes("Check <U1>"))
})

test("private packages, mismatched releases and other routes do not fetch diagnostics", async () => {
  for (const overrides of [
    { packageInfo: { ...packageInfo, is_private: true } },
    { packageInfo: { ...packageInfo, is_public: false } },
    { packageRelease: { ...packageRelease, package_id: "another-package" } },
    { packageRelease: null },
    { route: { ...route, kind: "package" } },
  ]) {
    const result = await fetchReleasePreviewDiagnostics({
      ...fetchOptions,
      ...overrides,
      fetchJson: () => {
        throw new Error("Must not fetch")
      },
    })
    assert.equal(result, null)
  }
})

test("missing or invalid circuit data is distinct from a clean circuit", async () => {
  for (const response of [
    null,
    { preview_circuit_json_response: { circuit_json_found: false } },
    {
      preview_circuit_json_response: {
        circuit_json_found: true,
        circuit_json: {},
      },
    },
  ]) {
    assert.equal(
      await fetchReleasePreviewDiagnostics({
        ...fetchOptions,
        fetchJson: async () => response,
      }),
      null,
    )
  }
  const unavailable = renderPackagePageContent(pageData)
  assert.ok(unavailable.includes("Circuit diagnostics are unavailable."))
  assert.ok(!unavailable.includes("No circuit errors or warnings found."))
  const clean = await fetchReleasePreviewDiagnostics({
    ...fetchOptions,
    fetchJson: async () => ({
      preview_circuit_json_response: {
        circuit_json_found: true,
        circuit_json: [],
      },
    }),
  })
  assert.ok(
    renderPackagePageContent({
      ...pageData,
      previewDiagnostics: clean,
    }).includes("No circuit errors or warnings found."),
  )
})

test("production handler serves diagnostics in HTML without browser code or authentication", async () => {
  const previousDevSsr = process.env.TSC_DEV_SSR
  process.env.TSC_DEV_SSR = "true"
  const originalFetch = globalThis.fetch
  const requested = []
  let returnedPackage = packageInfo
  let returnedRelease = packageRelease
  let returnedBuildReleaseId = "release-1"
  globalThis.fetch = async (request) => {
    const url = new URL(request.url)
    requested.push(url.pathname)
    assert.equal(request.headers.get("authorization"), null)
    const responses = {
      "/packages/get": { package: returnedPackage },
      "/packages/list_related_packages": { packages: [] },
      "/package_releases/get": { package_release: returnedRelease },
      "/package_releases/list": { package_releases: [] },
      "/package_files/list": { package_files: [] },
      "/package_builds/get": {
        package_build: {
          package_build_id: "build-1",
          package_release_id: returnedBuildReleaseId,
          circuit_json_build_logs: "Routing complete <script>",
        },
      },
      "/package_releases/get_preview_circuit_json": previewResponse,
    }
    assert.ok(url.pathname in responses, url.pathname)
    return Response.json(responses[url.pathname])
  }
  try {
    const { default: handler } = await import("../api/generated-index.js")
    let html
    const res = {
      setHeader() {},
      status(code) {
        assert.equal(code, 200)
        return this
      },
      send(value) {
        html = value
      },
    }
    await handler(
      { url: "/alice/board/releases/release-1/preview?tab=errors" },
      res,
    )
    assert.ok(requested.includes("/package_releases/get_preview_circuit_json"))
    assert.ok(html.includes("Circuit errors and warnings (2)"))
    assert.ok(html.includes("Routing complete &lt;script&gt;"))
    assert.ok(html.includes('data-server-rendered="true"'))
    returnedBuildReleaseId = "another-release"
    await handler(
      { url: "/alice/board/releases/release-1/preview?tab=errors" },
      res,
    )
    assert.ok(!html.includes("Routing complete"))
    for (const scenario of ["private", "mismatched"]) {
      requested.length = 0
      returnedPackage =
        scenario === "private"
          ? { ...packageInfo, is_private: true }
          : packageInfo
      returnedRelease =
        scenario === "mismatched"
          ? { ...packageRelease, package_id: "other-package" }
          : packageRelease
      await handler(
        { url: "/alice/board/releases/release-1/preview?tab=errors" },
        res,
      )
      assert.ok(
        !requested.includes("/package_releases/get_preview_circuit_json"),
      )
      assert.ok(!requested.includes("/package_builds/get"))
      assert.ok(!html.includes("Check &lt;U1&gt;"))
      assert.ok(!html.includes("Routing complete"))
    }
  } finally {
    globalThis.fetch = originalFetch
    if (previousDevSsr === undefined) {
      delete process.env.TSC_DEV_SSR
    } else {
      process.env.TSC_DEV_SSR = previousDevSsr
    }
  }
})

test("preview integration leaves the shared HTML template available to other pages", async () => {
  const { default: handler } = await import("../api/generated-index.js")
  let html
  const res = {
    setHeader() {},
    status(code) {
      assert.equal(code, 200)
      return this
    },
    send(value) {
      html = value
    },
  }
  await handler({ url: "/datasheets" }, res)
  assert.ok(
    html.includes(
      '<link rel="icon" href="/tscircuit-logo.png" type="image/png" sizes="460x460" />',
    ),
  )
})
