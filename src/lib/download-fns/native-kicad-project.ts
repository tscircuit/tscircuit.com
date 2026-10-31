import JSZip from "jszip"

export interface NativeKicadProjectArtifact {
  url: string
  sha256: string
  circuit_json_sha256: string
  project_file: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (!isRecord(value)) return value
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonical(value[key])]),
  )
}

/** Bind the archive to the viewer data, without hashing its own descriptor. */
export function nativeKicadCircuitText(circuitJson: unknown[]): string {
  return JSON.stringify(
    canonical(
      circuitJson.map((row) => {
        if (!isRecord(row) || row.type !== "source_project_metadata") return row
        const { native_kicad_project, source_filesystem_md5_hash, ...rest } =
          row
        return rest
      }),
    ),
  )
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    bytes as Uint8Array<ArrayBuffer>,
  )
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")
}

function safeArchivePath(path: string): boolean {
  const parts = (path.endsWith("/") ? path.slice(0, -1) : path).split("/")
  return (
    path.length > 0 &&
    !path.includes("\\") &&
    !path.startsWith("/") &&
    !path.includes(":") &&
    parts.every((part) => part.length > 0 && part !== ".." && part !== ".")
  )
}

/** Null means no native artifact was advertised; errors never trigger fallback. */
export async function downloadNativeKicadProject(
  circuitJson: unknown[],
  fetchFile: (url: string, options: RequestInit) => Promise<Response> = fetch,
): Promise<Blob | null> {
  const declarations = circuitJson.filter(
    (row) =>
      isRecord(row) &&
      row.type === "source_project_metadata" &&
      Object.hasOwn(row, "native_kicad_project"),
  ) as Record<string, unknown>[]
  if (!declarations.length) return null
  if (declarations.length !== 1)
    throw new Error("Multiple native KiCad project declarations")
  const artifact = declarations[0]!.native_kicad_project
  if (
    !isRecord(artifact) ||
    typeof artifact.url !== "string" ||
    typeof artifact.project_file !== "string" ||
    typeof artifact.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(artifact.sha256) ||
    typeof artifact.circuit_json_sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(artifact.circuit_json_sha256) ||
    !artifact.project_file.endsWith(".kicad_pro") ||
    !safeArchivePath(artifact.project_file)
  ) {
    throw new Error("Invalid native KiCad project declaration")
  }
  const url = new URL(artifact.url)
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error(
      "Native KiCad project requires an HTTPS URL without credentials",
    )
  if (
    (await sha256(
      new TextEncoder().encode(nativeKicadCircuitText(circuitJson)),
    )) !== artifact.circuit_json_sha256
  ) {
    throw new Error("Native KiCad project does not match this circuit revision")
  }
  const response = await fetchFile(url.href, {
    credentials: "omit",
    referrerPolicy: "no-referrer",
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok)
    throw new Error(
      `Native KiCad project download failed: HTTP ${response.status}`,
    )
  const bytes = new Uint8Array(await response.arrayBuffer())
  if ((await sha256(bytes)) !== artifact.sha256)
    throw new Error("Native KiCad archive SHA-256 mismatch")
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: true })
  for (const [name, file] of Object.entries(zip.files)) {
    const original =
      (file as typeof file & { unsafeOriginalName?: string })
        .unsafeOriginalName ?? name
    if (!safeArchivePath(original) || original !== name)
      throw new Error("Unsafe native KiCad archive path")
  }
  const stem = artifact.project_file.slice(0, -".kicad_pro".length)
  for (const extension of [".kicad_pro", ".kicad_pcb", ".kicad_sch"]) {
    if (!zip.file(stem + extension))
      throw new Error(
        `Incomplete native KiCad project: missing ${stem + extension}`,
      )
  }
  // Return the exact downloaded bytes; never parse/resave or regenerate copper.
  return new Blob([bytes], { type: "application/zip" })
}
