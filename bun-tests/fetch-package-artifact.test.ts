import { expect, test } from "bun:test"
import { fetchPackageArtifact } from "@/lib/fetch-package-artifact"

test("recovers a publication-time CDN miss without forwarding registry credentials", async () => {
  const original = globalThis.fetch
  const calls: [string, RequestInit | undefined][] = []
  try {
    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
      calls.push([String(url), init])
      if (calls.length > 1) return new Response("artifact")
      const response = new Response("cached miss", { status: 404 })
      Object.defineProperties(response, {
        redirected: { value: true },
        url: {
          value:
            "https://usercontent.tscircuit.com/orgs/o/builds/b/files/dist/bundle.gz",
        },
      })
      return response
    }) as typeof fetch
    const response = await fetchPackageArtifact({
      apiBaseUrl: "/api",
      packageFileId: "immutable-file",
      token: "registry-only",
    })
    expect(await response.text()).toBe("artifact")
    expect(calls).toHaveLength(2)
    expect(calls[1][0]).toEndWith("?package_file_id=immutable-file")
    expect(calls[0][1]?.headers).toEqual({
      Authorization: "Bearer registry-only",
    })
    expect(calls[1][1]?.headers).toBeUndefined()
    expect(calls[1][1]?.credentials).toBe("omit")
  } finally {
    globalThis.fetch = original
  }
})
