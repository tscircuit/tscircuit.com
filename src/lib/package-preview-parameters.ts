import { z } from "zod"
import { fetchPackageArtifact } from "./fetch-package-artifact"
import {
  derivePackageParameters,
  type PackagePropsSchema,
} from "./package-props-schema"

const value = z.union([z.boolean(), z.string().max(128), z.number().finite()])
const path = z.string().regex(/^dist\/(?!.*(?:\.\.|\\|:\/\/))[^?#]+$/)
const common = {
  id: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().min(1).max(120),
}
const parameter = z.discriminatedUnion("type", [
  z.object({ ...common, type: z.literal("boolean"), default: z.boolean() }),
  z.object({
    ...common,
    type: z.literal("number"),
    default: value,
    unit: z.string().max(32),
    options: z
      .array(z.object({ value, number: z.number().finite() }))
      .min(2)
      .max(128),
  }),
  z.object({
    ...common,
    type: z.literal("enum"),
    default: value,
    options: z
      .array(z.object({ value, label: z.string().max(128) }))
      .min(2)
      .max(128),
  }),
])
const artifacts = {
  bundlePath: path,
  variants: z
    .array(
      z.object({
        values: z.record(value),
        circuitJsonPath: path,
        glbPath: path,
      }),
    )
    .min(1)
    .max(256),
}
export const previewParameterManifestSchema = z.discriminatedUnion("version", [
  z.object({
    version: z.literal(1),
    parameters: z.array(parameter).min(1).max(16),
    defaults: z.record(value),
    ...artifacts,
  }),
  z.object({
    version: z.literal(2),
    propsSchemaPath: path,
    componentPartNumbers: z.array(z.string().min(1).max(512)).max(10000),
    ...artifacts,
  }),
])
export type PreviewParameterManifest = {
  version: 1 | 2
  parameters: z.infer<typeof parameter>[]
  defaults: Record<string, boolean | number | string>
  bundlePath: string
  variants: z.infer<typeof artifacts.variants>
  propsSchemaPath?: string
  componentPartNumbers?: string[]
}
export type PreviewParameterValues = PreviewParameterManifest["defaults"]
export const parameterStateKey = (values: Record<string, unknown>) =>
  JSON.stringify(
    Object.keys(values)
      .sort()
      .map((key) => [key, values[key]]),
  )
export const findParameterVariant = (
  manifest: PreviewParameterManifest,
  values: PreviewParameterValues,
) =>
  manifest.variants.find(
    (variant) =>
      parameterStateKey(variant.values) === parameterStateKey(values),
  )
export const findParameterVariantByPath = (
  manifest: PreviewParameterManifest,
  file?: string,
) =>
  manifest.variants.find((variant) => variant.circuitJsonPath === file) ??
  findParameterVariant(manifest, manifest.defaults)!

export function parsePreviewParameterManifest(
  data: unknown,
  files: { file_path: string }[],
  propsSchema?: unknown,
): PreviewParameterManifest {
  const raw = previewParameterManifestSchema.parse(data)
  let manifest: PreviewParameterManifest
  let domains: Record<string, (string | boolean | number)[]>
  if (raw.version === 2) {
    if (!propsSchema)
      throw new Error("This package build requires its published props schema")
    const generated = derivePackageParameters(propsSchema as PackagePropsSchema)
    manifest = {
      ...raw,
      parameters: z.array(parameter).parse(generated.parameters),
      defaults: z.record(value).parse(generated.defaults),
    }
    domains = generated.domains
  } else {
    manifest = raw
    domains = Object.fromEntries(
      raw.parameters.map((p) => [
        p.id,
        p.type === "boolean"
          ? [false, true]
          : p.options.map((option) => option.value),
      ]),
    )
  }
  const ids = manifest.parameters.map((p) => p.id)
  const defaultIds = Object.keys(manifest.defaults)
  if (
    new Set(ids).size !== ids.length ||
    defaultIds.length !== Object.keys(domains).length ||
    manifest.parameters.some((p) => p.default !== manifest.defaults[p.id]) ||
    defaultIds.some((id) => !domains[id]?.includes(manifest.defaults[id]))
  )
    throw new Error("Invalid parameter defaults or duplicate IDs")
  for (const p of manifest.parameters) {
    if (p.type === "boolean") continue
    if (
      new Set(p.options.map((o) => o.value)).size !== p.options.length ||
      (p.type === "number" &&
        p.options.some((o, i) => i > 0 && o.number <= p.options[i - 1].number))
    )
      throw new Error(
        "Parameter choices must be unique and numeric options ordered",
      )
  }
  const keys = new Set<string>(),
    paths = new Set<string>()
  for (const variant of manifest.variants) {
    const key = parameterStateKey(variant.values)
    if (
      Object.keys(variant.values).length !== defaultIds.length ||
      defaultIds.some((id) => !domains[id]?.includes(variant.values[id])) ||
      keys.has(key) ||
      paths.has(variant.circuitJsonPath)
    )
      throw new Error("Invalid or duplicate parameter state")
    keys.add(key)
    paths.add(variant.circuitJsonPath)
  }
  if (
    Object.values(domains).reduce(
      (count, choices) => count * choices.length,
      1,
    ) !== keys.size
  )
    throw new Error("The build must include every supported schema combination")
  if (!keys.has(parameterStateKey(manifest.defaults)))
    throw new Error("Missing default parameter state")
  const available = new Set(files.map((file) => file.file_path))
  if (
    !available.has(manifest.bundlePath) ||
    (manifest.propsSchemaPath && !available.has(manifest.propsSchemaPath)) ||
    manifest.variants.some(
      (variant) =>
        !available.has(variant.circuitJsonPath) ||
        !available.has(variant.glbPath),
    )
  )
    throw new Error("Parameter artifacts are missing from this release")
  return manifest
}

export async function downloadPreviewCircuitBundle({
  apiBaseUrl,
  packageFileId,
  token,
  signal,
  manifest,
}: {
  apiBaseUrl: string
  packageFileId: string
  token?: string
  signal?: AbortSignal
  manifest: PreviewParameterManifest
}) {
  const response = await fetchPackageArtifact({
    apiBaseUrl,
    packageFileId,
    token,
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(60_000)])
      : AbortSignal.timeout(60_000),
  })
  if (!response.ok || !response.body)
    throw new Error("Unable to load parameter circuits")
  // Bound decoded data before parsing, including gzip decompression.
  const reader = response.body
    .pipeThrough(new DecompressionStream("gzip"))
    .getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 64 * 1024 * 1024)
        throw new Error("Parameter circuit bundle exceeds 64 MB")
      chunks.push(value)
    }
  } finally {
    await reader.cancel()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  const bundle = JSON.parse(new TextDecoder().decode(bytes)) as Record<
    string,
    any[]
  >
  if (
    !bundle ||
    typeof bundle !== "object" ||
    Array.isArray(bundle) ||
    Object.keys(bundle).length !== manifest.variants.length ||
    manifest.variants.some(
      (v) =>
        !Array.isArray(bundle[v.circuitJsonPath]) ||
        !bundle[v.circuitJsonPath].some((e) => e?.type === "pcb_board") ||
        bundle[v.circuitJsonPath].some(
          (e) => !e || typeof e.type !== "string" || e.type.endsWith("_error"),
        ),
    )
  )
    throw new Error("Invalid parameter circuit bundle")
  return bundle
}
