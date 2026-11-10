import type redaxios from "redaxios"
import type { Package, PackageFile } from "fake-snippets-api/lib/db/schema"
import { previewParameterManifestSchema } from "./package-preview-parameters"

export type ReferenceDesignCatalogEntry = {
  name: string
  componentPartNumbers: string[]
}

async function loadReferenceDesignCatalogEntry(
  name: string,
  axios: Pick<typeof redaxios, "get">,
): Promise<ReferenceDesignCatalogEntry> {
  const {
    data: { package: pkg },
  } = await axios.get<{ package: Package }>("/packages/get", {
    params: { name },
  })
  if (!pkg.last_built_release_id)
    throw new Error(`No completed build for ${name}`)
  const {
    data: { package_files },
  } = await axios.get<{ package_files: PackageFile[] }>("/package_files/list", {
    params: { package_release_id: pkg.last_built_release_id },
  })
  const manifestFile = package_files.find(
    (file) => file.file_path === "dist/preview.json",
  )
  if (!manifestFile) throw new Error(`No reference-design manifest for ${name}`)
  const {
    data: { package_file },
  } = await axios.get<{ package_file: PackageFile }>("/package_files/get", {
    params: { package_file_id: manifestFile.package_file_id },
  })
  const manifest = previewParameterManifestSchema.parse(
    JSON.parse(package_file.content_text!),
  )
  return { name, componentPartNumbers: manifest.componentPartNumbers }
}

export async function loadReferenceDesignCatalog(
  names: readonly string[],
  axios: Pick<typeof redaxios, "get">,
) {
  const pending = [...new Set(names)]
  const entries: ReferenceDesignCatalogEntry[] = []
  const failed: string[] = []
  await Promise.all(
    Array.from({ length: Math.min(3, pending.length) }, async () => {
      while (pending.length) {
        const name = pending.shift()!
        try {
          entries.push(await loadReferenceDesignCatalogEntry(name, axios))
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
          (mpn) => mpn.trim().toUpperCase() === chipName.trim().toUpperCase(),
        ),
      )
      .map((entry) => entry.name),
  )
  return names.filter(
    (name, index) => matching.has(name) && names.indexOf(name) === index,
  )
}
