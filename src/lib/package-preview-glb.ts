type PreviewFile = { file_path: string; package_file_id: string }

const normalizePath = (path: string) =>
  path.replace(/\\/g, "/").replace(/^(?:\.\/|\/)+/, "")

/** Select the assembly output for the preview entrypoint, never a part model or archive. */
export function findPackagePreviewGlb<T extends PreviewFile>(
  files: T[] = [],
  componentPath?: string,
): T | undefined {
  const candidates: string[] = []
  if (componentPath) {
    const path = normalizePath(componentPath)
    if (path.startsWith("dist/") || path.endsWith("/circuit.json"))
      candidates.push(`${path.slice(0, path.lastIndexOf("/"))}/3d.glb`)
    // CLI versions differ on whether the .circuit suffix remains in dist.
    candidates.push(
      `dist/${path.replace(/\.circuit\.(tsx|json)$/, "").replace(/\.tsx$/, "")}/3d.glb`,
    )
    candidates.push(`dist/${path.replace(/\.[^/.]+$/, "")}/3d.glb`)
  } else candidates.push("dist/index/3d.glb")
  candidates.push("dist/3d.glb", "3d.glb")

  for (const path of candidates) {
    const match = files.find((file) => normalizePath(file.file_path) === path)
    if (match) return match
  }
}

/** Fetch the selected release's assembly with the same authorization as model downloads. */
export async function downloadPackagePreviewGlb({
  apiBaseUrl,
  packageFileId,
  token,
  signal,
}: {
  apiBaseUrl: string
  packageFileId: string
  token?: string
  signal?: AbortSignal
}): Promise<ArrayBuffer> {
  const response = await fetch(
    `${apiBaseUrl.replace(/\/$/, "")}/package_files/download?${new URLSearchParams({ package_file_id: packageFileId })}`,
    {
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(30_000)])
        : AbortSignal.timeout(30_000),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  )
  if (!response.ok)
    throw new Error(`Unable to load preview GLB (${response.status})`)
  const bytes = await response.arrayBuffer()
  // Reject error pages, truncated files and invalid GLBs before handing them to the viewer.
  if (bytes.byteLength < 28) throw new Error("Invalid preview GLB")
  const header = new DataView(bytes)
  if (
    header.getUint32(0, true) !== 0x46546c67 ||
    header.getUint32(4, true) !== 2 ||
    header.getUint32(8, true) !== bytes.byteLength
  )
    throw new Error("Invalid preview GLB")
  return bytes
}
