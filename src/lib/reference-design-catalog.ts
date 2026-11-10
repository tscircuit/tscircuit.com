import { previewParameterManifestSchema } from "./package-preview-parameters"

type Get = (
  path: string,
  options: { params: Record<string, string> },
) => Promise<{ data: any }>
export type ReferenceDesignCatalogEntry = {
  name: string
  componentPartNumbers: string[]
}
export const normalizePartNumber = (name: string) => name.trim().toUpperCase()

/** Inspect ordinary package builds; older static builds need no preview manifest. */
export async function loadReferenceDesignCatalogEntry(
  name: string,
  get: Get,
): Promise<ReferenceDesignCatalogEntry> {
  const {
    data: { package: pkg },
  } = await get("/packages/get", { params: { name } })
  const releaseId = pkg?.last_built_release_id
  if (!releaseId) throw new Error(`No completed build for ${name}`)
  const { data } = await get("/package_files/list", {
    params: { package_release_id: releaseId },
  })
  const file = data.package_files?.find(
    (file: { file_path: string }) => file.file_path === "dist/preview.json",
  )
  if (file) {
    const { data } = await get("/package_files/get", {
      params: { package_file_id: file.package_file_id },
    })
    const manifest = previewParameterManifestSchema.parse(
      JSON.parse(data.package_file.content_text),
    )
    if (manifest.version === 2)
      return { name, componentPartNumbers: manifest.componentPartNumbers }
  }
  const { data: preview } = await get(
    "/package_releases/get_preview_circuit_json",
    { params: { package_release_id: releaseId } },
  )
  const json = preview.preview_circuit_json_response?.circuit_json
  if (!Array.isArray(json)) throw new Error(`No built circuit for ${name}`)
  return {
    name,
    componentPartNumbers: [
      ...new Set<string>(
        json
          .filter(
            (e) =>
              e.type === "source_component" &&
              typeof e.manufacturer_part_number === "string",
          )
          .map((e) => e.manufacturer_part_number),
      ),
    ],
  }
}

export async function loadReferenceDesignCatalog(
  names: readonly string[],
  get: Get,
) {
  const pending = [...new Set(names)]
  const entries: ReferenceDesignCatalogEntry[] = []
  const failed: string[] = []
  await Promise.all(
    Array.from({ length: Math.min(3, pending.length) }, async () => {
      while (pending.length) {
        const name = pending.shift()!
        try {
          entries.push(await loadReferenceDesignCatalogEntry(name, get))
        } catch {
          failed.push(name)
        }
      }
    }),
  )
  return { entries, failed }
}

export function referenceDesignsForPart(
  entries: readonly ReferenceDesignCatalogEntry[],
  names: readonly string[],
  chipName: string,
) {
  const matching = new Set(
    entries
      .filter((entry) =>
        entry.componentPartNumbers.some(
          (mpn) => normalizePartNumber(mpn) === normalizePartNumber(chipName),
        ),
      )
      .map((entry) => entry.name),
  )
  return names.filter(
    (name, index) => matching.has(name) && names.indexOf(name) === index,
  )
}
