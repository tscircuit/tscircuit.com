import { expect, test } from "bun:test"
import { PACKAGE_SSR_DEADLINE_MS } from "../server/ssr-deadline.js"

const previousDevSsr = process.env.TSC_DEV_SSR
process.env.TSC_DEV_SSR = "true"
const { default: handler } = await import("../api/generated-index.js")
if (previousDevSsr === undefined) delete process.env.TSC_DEV_SSR
else process.env.TSC_DEV_SSR = previousDevSsr

const packageInfo = {
  package_id: "package-1",
  name: "alice/board",
  is_private: true,
}
const release = { package_release_id: "release-1", version: "1.0.0" }

async function getPage(fetchImpl) {
  const originalFetch = globalThis.fetch
  const response = {
    headers: {},
    sends: 0,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    send(html) {
      this.html = html
      this.sends++
    },
  }
  globalThis.fetch = fetchImpl
  try {
    await handler({ url: "/alice/board" }, response)
    return response
  } finally {
    globalThis.fetch = originalFetch
  }
}

function expectShell(response) {
  expect(response.statusCode).toBe(200)
  expect(response.headers["Cache-Control"]).toBe("no-store")
  expect(response.html).toContain('id="root"')
  expect(response.html).not.toContain("window.SSR_PACKAGE =")
  expect(response.html).not.toContain('data-ssr-package-page="package"')
  expect(response.sends).toBe(1)
}

test("a stalled initial package lookup returns the shell and is aborted", async () => {
  let requests = 0
  let signal
  const started = performance.now()
  const response = await getPage((request) => {
    requests++
    signal = request.signal
    // Intentionally ignores abort, proving the fallback doesn't depend on fetch.
    return new Promise(() => {})
  })
  expectShell(response)
  expect(requests).toBe(1)
  expect(signal.aborted).toBe(true)
  expect(performance.now() - started).toBeGreaterThanOrEqual(
    PACKAGE_SSR_DEADLINE_MS - 100,
  )
  expect(performance.now() - started).toBeLessThan(PACKAGE_SSR_DEADLINE_MS + 1500)
}, 8000)

test("sequential registry calls share one budget and cannot send a late response", async () => {
  const requests = []
  let finishLateRequest
  const started = performance.now()
  const response = await getPage(async (request) => {
    const path = new URL(request.url).pathname
    requests.push(request)
    if (path === "/packages/get") {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      return Response.json({ package: packageInfo })
    }
    if (path === "/package_releases/get") {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      return Response.json({ package_release: release })
    }
    if (path === "/package_releases/list") {
      return new Promise((resolve) => {
        finishLateRequest = () => resolve(Response.json({ package_releases: [] }))
      })
    }
    throw new Error(`Unexpected request: ${path}`)
  })
  expectShell(response)
  expect(requests).toHaveLength(3)
  expect(requests.every((request) => request.signal.aborted)).toBe(true)
  expect(performance.now() - started).toBeLessThan(PACKAGE_SSR_DEADLINE_MS + 1500)
  finishLateRequest()
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(response.sends).toBe(1)
}, 8000)

test("healthy registry responses preserve package SSR", async () => {
  const response = await getPage(async (request) => {
    switch (new URL(request.url).pathname) {
      case "/packages/get":
        return Response.json({ package: packageInfo })
      case "/package_releases/get":
        return Response.json({ package_release: release })
      case "/package_releases/list":
        return Response.json({ package_releases: [release] })
      case "/package_files/list":
        return Response.json({ package_files: [] })
      default:
        throw new Error("Unexpected registry request")
    }
  })
  expect(response.statusCode).toBe(200)
  expect(response.html).toContain('data-ssr-package-page="package"')
  expect(response.html).toContain("window.SSR_PACKAGE =")
  expect(response.headers["Cache-Control"]).not.toBe("no-store")
})

test("real missing packages still return 404", async () => {
  const response = await getPage(async () => new Response("", { status: 404 }))
  expect(response.statusCode).toBe(404)
  expect(response.html).toContain("Package Not Found")
})

test("registry failures return the shell without retrying", async () => {
  let requests = 0
  const response = await getPage(async () => {
    requests++
    return new Response("", { status: 503 })
  })
  expectShell(response)
  expect(requests).toBe(1)
})
