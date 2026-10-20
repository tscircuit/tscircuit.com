import { describe, expect, test } from "bun:test"

const previousDevSsr = process.env.TSC_DEV_SSR
process.env.TSC_DEV_SSR = "true"
const { default: handler } = await import("../api/generated-index.js")
if (previousDevSsr === undefined) delete process.env.TSC_DEV_SSR
else process.env.TSC_DEV_SSR = previousDevSsr

async function renderPage(url) {
  const requests = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (request) => {
    const url = new URL(request.url)
    const body = request.method === "POST" ? await request.json() : null
    requests.push({ path: url.pathname, query: url.searchParams, body })

    switch (url.pathname) {
      case "/packages/get":
        return Response.json({
          package: {
            package_id: "package-1",
            name: "alice/board",
            latest_version: "2.0.0",
            latest_package_release_id: "latest-release",
          },
        })
      case "/packages/list_related_packages":
        return Response.json({ packages: [] })
      case "/package_releases/get":
        return Response.json({
          package_release: {
            package_release_id: body.package_name_with_version
              ? "older-release"
              : "latest-release",
            version: body.package_name_with_version ? "1.0.0" : "2.0.0",
          },
        })
      case "/package_releases/list":
        return Response.json({
          package_releases: [
            { package_release_id: "older-release", version: "1.0.0" },
            { package_release_id: "latest-release", version: "2.0.0" },
          ],
        })
      case "/package_files/list":
        return Response.json({
          package_files: [
            { package_file_id: "readme", file_path: "README.md" },
          ],
        })
      case "/package_files/get":
        return Response.json({
          package_file: { file_path: "README.md", content_text: "# Board" },
        })
      default:
        throw new Error(`Unexpected SSR request: ${url.pathname}`)
    }
  }

  const response = {
    setHeader() {},
    status(code) {
      this.statusCode = code
      return this
    },
    send(html) {
      this.html = html
    },
  }
  try {
    await handler({ url }, response)
    return { ...response, requests }
  } finally {
    globalThis.fetch = originalFetch
  }
}

describe("package SSR data loading", () => {
  test.each([
    ["/alice/board", "latest-release"],
    ["/alice/board?version=1.0.0", "older-release"],
    ["/alice/board/tree/src?version=1.0.0", "older-release"],
    ["/alice/board/blob/README.md?version=1.0.0", "older-release"],
  ])("%s fetches only the selected release's files", async (url, releaseId) => {
    const { html, statusCode, requests } = await renderPage(url)
    expect(statusCode).toBe(200)
    expect(
      requests.filter((r) => r.path === "/package_releases/list"),
    ).toHaveLength(0)
    expect(html).not.toContain("window.SSR_PACKAGE_RELEASES")
    const fileLists = requests.filter((r) => r.path === "/package_files/list")
    expect(fileLists).toHaveLength(1)
    expect(fileLists[0].query.get("package_release_id")).toBe(releaseId)
  })

  test("the explicit releases page loads history without loading release files", async () => {
    const { html, statusCode, requests } = await renderPage(
      "/alice/board/releases",
    )
    expect(statusCode).toBe(200)
    expect(html).toContain("window.SSR_PACKAGE_RELEASES")
    expect(html).toContain("1.0.0")
    expect(
      requests.filter((r) => r.path === "/package_releases/list"),
    ).toHaveLength(1)
    expect(
      requests.filter((r) => r.path.startsWith("/package_files/")),
    ).toHaveLength(0)
  })
})
