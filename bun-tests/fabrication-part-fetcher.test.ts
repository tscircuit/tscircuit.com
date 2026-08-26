import { expect, spyOn, test } from "bun:test"
import { createFabricationPartFetcher } from "@/lib/download-fns/prepare-jlcpcb-pick-and-place"

test("export-time supplier lookup uses the configured authenticated proxy", async () => {
  const calls: { url: string; headers: Headers }[] = []
  const mockFetch: typeof fetch = Object.assign(
    async (
      input: Parameters<typeof fetch>[0],
      init?: Parameters<typeof fetch>[1],
    ) => {
      calls.push({ url: String(input), headers: new Headers(init?.headers) })
      return new Response("unavailable", { status: 503 })
    },
    { preconnect: globalThis.fetch.preconnect },
  )
  const fetchSpy = spyOn(globalThis, "fetch").mockImplementation(mockFetch)
  try {
    const fetchPart = createFabricationPartFetcher({
      easyEdaProxyConfig: {
        proxyEndpointUrl: "https://example.com/proxy",
        headers: { Authorization: "Bearer test-token" },
      },
    })
    expect(calls).toHaveLength(0)
    await expect(fetchPart("C85202")).rejects.toThrow()
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe("https://example.com/proxy")
    expect(calls[0].headers.get("Authorization")).toBe("Bearer test-token")
    expect(calls[0].headers.get("X-Target-Url")).toContain("easyeda.com")
  } finally {
    fetchSpy.mockRestore()
  }
})
