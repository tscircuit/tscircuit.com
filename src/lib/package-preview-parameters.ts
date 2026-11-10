import { z } from "zod"
import { fetchPackageArtifact } from "./fetch-package-artifact"

const value = z.union([z.boolean(), z.string().max(128), z.number().finite()])
const path = z.string().regex(/^dist\/(?!.*(?:\.\.|\\|:\/\/))[^?#]+$/)
const common = {
  id: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().min(1).max(120),
  description: z.string().max(1000),
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
])
export const previewParameterManifestSchema = z
  .object({
    version: z.literal(1),
    parameters: z.array(parameter).min(1).max(16),
    defaults: z.record(value),
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
  })
  .superRefine((manifest, ctx) => {
    const keys = new Set<string>()
    const paths = new Set<string>()
    const ids = manifest.parameters.map((p) => p.id)
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: "custom", message: "Duplicate parameter IDs" })
    const valid = (values: Record<string, unknown>) =>
      Object.keys(values).length === ids.length &&
      manifest.parameters.every((p) =>
        p.type === "boolean"
          ? typeof values[p.id] === "boolean"
          : p.options.some((o) => o.value === values[p.id]),
      )
    if (
      !valid(manifest.defaults) ||
      manifest.parameters.some((p) => p.default !== manifest.defaults[p.id])
    )
      ctx.addIssue({ code: "custom", message: "Invalid parameter defaults" })
    for (const p of manifest.parameters)
      if (
        p.type === "number" &&
        (new Set(p.options.map((o) => o.value)).size !== p.options.length ||
          p.options.some(
            (o, i) => i > 0 && o.number <= p.options[i - 1].number,
          ))
      )
        ctx.addIssue({
          code: "custom",
          message: "Slider options must be unique and ordered",
        })
    for (const v of manifest.variants) {
      const key = parameterStateKey(v.values)
      if (!valid(v.values) || keys.has(key) || paths.has(v.circuitJsonPath))
        ctx.addIssue({
          code: "custom",
          message: "Invalid or duplicate parameter state",
        })
      keys.add(key)
      paths.add(v.circuitJsonPath)
    }
    if (!keys.has(parameterStateKey(manifest.defaults)))
      ctx.addIssue({
        code: "custom",
        message: "Missing default parameter state",
      })
  })
export type PreviewParameterManifest = z.infer<
  typeof previewParameterManifestSchema
>
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
    (v) => parameterStateKey(v.values) === parameterStateKey(values),
  )
export const findParameterVariantByPath = (
  manifest: PreviewParameterManifest,
  path?: string,
) =>
  manifest.variants.find((v) => v.circuitJsonPath === path) ??
  findParameterVariant(manifest, manifest.defaults)!

export function parsePreviewParameterManifest(
  data: unknown,
  files: { file_path: string }[],
) {
  const manifest = previewParameterManifestSchema.parse(data)
  const paths = new Set(files.map((f) => f.file_path))
  if (
    !paths.has(manifest.bundlePath) ||
    manifest.variants.some(
      (v) => !paths.has(v.circuitJsonPath) || !paths.has(v.glbPath),
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
