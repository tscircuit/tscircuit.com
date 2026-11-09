import type { CircuitJson } from "circuit-json"
import type {
  PublishedReferenceDesign,
  ReferenceDesignConfiguration,
} from "@tscircuit/runframe/reference-designs"

async function downloadReferenceDesignFile(request: {
  apiBaseUrl: string
  packageFileId: string
  sha256: string
  signal: AbortSignal
}) {
  const response = await fetch(
    `${request.apiBaseUrl.replace(/\/$/, "")}/package_files/download?${new URLSearchParams({ package_file_id: request.packageFileId })}`,
    {
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
    },
  )
  if (!response.ok) throw new Error("Unable to load configuration")
  const bytes = await response.arrayBuffer()
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")
  if (hash !== request.sha256)
    throw new Error(
      "This configuration has changed. Reload to use the latest build.",
    )
  return bytes
}

export async function loadReferenceDesignArtifacts(request: {
  apiBaseUrl: string
  publishedReferenceDesign: PublishedReferenceDesign
  configuration: ReferenceDesignConfiguration
  signal: AbortSignal
}) {
  const { configuration, publishedReferenceDesign, apiBaseUrl, signal } =
    request
  const circuitFile = publishedReferenceDesign.files.find(
    (file) => file.file_path === configuration.circuit_json_path,
  )
  const glbFile = publishedReferenceDesign.files.find(
    (file) => file.file_path === configuration.glb_path,
  )
  if (!circuitFile || !glbFile)
    throw new Error("Configuration files are missing")
  const [circuitBytes, glbData] = await Promise.all([
    downloadReferenceDesignFile({
      apiBaseUrl,
      packageFileId: circuitFile.package_file_id,
      sha256: configuration.circuit_json_sha256,
      signal,
    }),
    downloadReferenceDesignFile({
      apiBaseUrl,
      packageFileId: glbFile.package_file_id,
      sha256: configuration.glb_sha256,
      signal,
    }),
  ])
  const circuitJson: CircuitJson = JSON.parse(
    new TextDecoder().decode(circuitBytes),
  )
  if (!Array.isArray(circuitJson)) throw new Error("Invalid circuit file")
  return { circuitJson, glbData }
}
