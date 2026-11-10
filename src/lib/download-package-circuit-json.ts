import type { AnyCircuitElement } from "circuit-json"
import { fetchPackageArtifact } from "./fetch-package-artifact"

/** Read ordinary package JSON files, including compressed large-board artifacts. */
export async function downloadPackageCircuitJson({
  apiBaseUrl,
  packageFileId,
  token,
  signal,
}: {
  apiBaseUrl: string
  packageFileId: string
  token?: string
  signal?: AbortSignal
}): Promise<AnyCircuitElement[]> {
  const response = await fetchPackageArtifact({
    apiBaseUrl,
    packageFileId,
    token,
    signal,
  })
  if (!response.ok)
    throw new Error(`Unable to load Circuit JSON (${response.status})`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  const body =
    bytes[0] === 0x1f && bytes[1] === 0x8b
      ? new Response(
          new Blob([bytes])
            .stream()
            .pipeThrough(new DecompressionStream("gzip")),
        )
      : new Response(bytes)
  const circuitJson = await body.json()
  if (!Array.isArray(circuitJson))
    throw new Error("Package file does not contain a Circuit JSON array")
  return circuitJson
}
