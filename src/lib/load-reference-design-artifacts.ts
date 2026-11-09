import type { CircuitJson } from "circuit-json"
import type {
  PublishedReferenceDesign,
  ReferenceDesignConfiguration,
} from "@tscircuit/runframe/reference-designs"

async function downloadReferenceDesignFile(request: {
  url: string
  sha256: string
  signal: AbortSignal
}) {
  const response = await fetch(request.url, {
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
  })
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
  artifactBaseUrl?: string
  publishedReferenceDesign: PublishedReferenceDesign
  configuration: ReferenceDesignConfiguration
  signal: AbortSignal
}) {
  const {
    configuration,
    publishedReferenceDesign,
    apiBaseUrl,
    artifactBaseUrl,
    signal,
  } = request
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
      url: artifactBaseUrl
        ? `${artifactBaseUrl}/${configuration.circuit_json_path}`
        : `${apiBaseUrl.replace(/\/$/, "")}/package_files/download?${new URLSearchParams({ package_file_id: circuitFile.package_file_id })}`,
      sha256: configuration.circuit_json_sha256,
      signal,
    }),
    downloadReferenceDesignFile({
      url: artifactBaseUrl
        ? `${artifactBaseUrl}/${configuration.glb_path}`
        : `${apiBaseUrl.replace(/\/$/, "")}/package_files/download?${new URLSearchParams({ package_file_id: glbFile.package_file_id })}`,
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
