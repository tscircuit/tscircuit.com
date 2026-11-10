import { z } from "zod"
import { previewParameterManifestSchema } from "./package-preview-parameters"

type RegistryGet = (
  route: string,
  options: { params: Record<string, string> },
) => Promise<{ data: unknown }>

export type ReferenceDesignCatalogEntry = {
  name: string
  componentPartNumbers: string[]
}

const packageResponseSchema = z.object({
  package: z.object({ last_built_release_id: z.string().nullish() }),
})
const packageFilesResponseSchema = z.object({
  package_files: z.array(
    z.object({ file_path: z.string(), package_file_id: z.string() }),
  ),
})
const packageFileResponseSchema = z.object({
  package_file: z.object({ content_text: z.string() }),
})
const circuitPreviewResponseSchema = z.object({
  preview_circuit_json_response: z.object({
    circuit_json: z
      .array(
        z.object({
          type: z.string(),
          manufacturer_part_number: z.string().nullish(),
        }),
      )
      .nullish(),
  }),
})
const normalizePartNumber = (partNumber: string) =>
  partNumber.trim().toUpperCase()

/** Inspect ordinary package builds; older static builds need no preview manifest. */
async function loadReferenceDesignCatalogEntry(
  name: string,
  get: RegistryGet,
): Promise<ReferenceDesignCatalogEntry> {
  const packageResponse = await get("/packages/get", { params: { name } })
  const { package: registryPackage } = packageResponseSchema.parse(
    packageResponse.data,
  )
  const { last_built_release_id } = registryPackage
  if (!last_built_release_id) throw new Error(`No completed build for ${name}`)
  const filesResponse = await get("/package_files/list", {
    params: { package_release_id: last_built_release_id },
  })
  const { package_files } = packageFilesResponseSchema.parse(filesResponse.data)
  const manifestFile = package_files.find(
    (file) => file.file_path === "dist/preview.json",
  )
  if (manifestFile) {
    const manifestResponse = await get("/package_files/get", {
      params: { package_file_id: manifestFile.package_file_id },
    })
    const { package_file } = packageFileResponseSchema.parse(
      manifestResponse.data,
    )
    const manifest = previewParameterManifestSchema.parse(
      JSON.parse(package_file.content_text),
    )
    if (manifest.version === 2)
      return { name, componentPartNumbers: manifest.componentPartNumbers }
  }
  const previewResponse = await get(
    "/package_releases/get_preview_circuit_json",
    {
      params: { package_release_id: last_built_release_id },
    },
  )
  const { preview_circuit_json_response } = circuitPreviewResponseSchema.parse(
    previewResponse.data,
  )
  const circuitJson = preview_circuit_json_response.circuit_json
  if (!circuitJson) throw new Error(`No built circuit for ${name}`)
  return {
    name,
    componentPartNumbers: [
      ...new Set(
        circuitJson.flatMap((element) =>
          element.type === "source_component" &&
          element.manufacturer_part_number
            ? [element.manufacturer_part_number]
            : [],
        ),
      ),
    ],
  }
}

export async function loadReferenceDesignCatalog(
  names: readonly string[],
  get: RegistryGet,
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

export function referenceDesignsForPart({
  entries,
  names,
  chipName,
}: {
  entries: readonly ReferenceDesignCatalogEntry[]
  names: readonly string[]
  chipName: string
}) {
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
