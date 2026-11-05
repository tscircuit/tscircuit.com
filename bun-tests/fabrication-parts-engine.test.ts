import { expect, mock, test } from "bun:test"
import { getFabricationPartsEngine } from "@/lib/fabrication/get-fabrication-parts-engine"

for (const token of [undefined, "fixture-session-token"]) {
  test(`fabrication supplier requests use the configured proxy ${token ? "with authentication" : "without a session"}`, async () => {
    const requests: { url: string; headers: Headers }[] = []
    const platformFetch = mock(
      async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
        requests.push({
          url: String(input),
          headers: new Headers(init?.headers),
        })
        throw new Error("fixture stops before external I/O")
      },
    ) as unknown as typeof fetch
    const engine = await getFabricationPartsEngine({
      apiBaseUrl: "https://registry.example/api",
      token,
      platformFetch,
    })
    await expect(
      engine.fetchPartCircuitJson({ supplierPartNumber: "C2040" }),
    ).rejects.toThrow()
    expect(requests.length).toBeGreaterThan(0)
    expect(requests[0]!.url).toBe("https://registry.example/api/proxy")
    expect(requests[0]!.headers.get("Authorization")).toBe(
      token ? `Bearer ${token}` : null,
    )
    expect(requests[0]!.headers.get("X-Target-Url")).toContain("easyeda.com")
  })
}
