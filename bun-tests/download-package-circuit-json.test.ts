import { expect, test } from "bun:test"
import { downloadPackageCircuitJson } from "../src/lib/download-package-circuit-json"

test("package downloads decode compressed boards and reject invalid circuit files", async () => {
  const circuit = [
    {
      type: "source_component",
      source_component_id: "processor",
      name: "U1",
      ftype: "simple_chip",
    },
  ]
  const server = Bun.serve({
    port: 0,
    fetch(request) {
      const id = new URL(request.url).searchParams.get("package_file_id")
      if (id === "gzip")
        return new Response(Bun.gzipSync(JSON.stringify(circuit)), {
          headers: { "Content-Type": "application/gzip" },
        })
      if (id === "plain") return Response.json(circuit)
      if (id === "invalid") return Response.json({ error: "not a circuit" })
      return new Response("Missing", { status: 404 })
    },
  })
  try {
    for (const packageFileId of ["gzip", "plain"])
      expect(
        await downloadPackageCircuitJson({
          apiBaseUrl: server.url.toString(),
          packageFileId,
        }),
      ).toEqual(circuit)
    await expect(
      downloadPackageCircuitJson({
        apiBaseUrl: server.url.toString(),
        packageFileId: "invalid",
      }),
    ).rejects.toThrow("Circuit JSON array")
    await expect(
      downloadPackageCircuitJson({
        apiBaseUrl: server.url.toString(),
        packageFileId: "missing",
      }),
    ).rejects.toThrow("404")
  } finally {
    await server.stop()
  }
})
