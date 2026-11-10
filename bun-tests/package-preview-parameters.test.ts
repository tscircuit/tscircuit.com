import { expect, spyOn, test } from "bun:test"
import { gzipSync } from "node:zlib"
import {
  downloadPreviewCircuitBundle,
  findParameterVariant,
  parameterStateKey,
  parsePreviewParameterManifest,
} from "@/lib/package-preview-parameters"
const manifest = () => ({
  version: 1,
  parameters: [
    {
      id: "header",
      type: "boolean",
      label: "Header",
      default: true,
    },
    {
      id: "resistor",
      type: "number",
      label: "Pull-up",
      unit: "kΩ",
      default: "100k",
      options: [
        { value: "10k", number: 10 },
        { value: "100k", number: 100 },
      ],
    },
  ],
  defaults: { header: true, resistor: "100k" },
  bundlePath: "dist/bundle.json.gz",
  variants: [true, false].flatMap((header) =>
    ["10k", "100k"].map((resistor) => ({
      values: { header, resistor },
      circuitJsonPath: `dist/${header}-${resistor}/circuit.json.gz`,
      glbPath: `dist/models/${header}/3d.glb`,
    })),
  ),
})
const files = (m: ReturnType<typeof manifest>) =>
  [
    m.bundlePath,
    ...m.variants.flatMap((v) => [v.circuitJsonPath, v.glbPath]),
  ].map((file_path) => ({ file_path }))
test("resolves exact combined parameters independently of property order", () => {
  const raw = manifest()
  const m = parsePreviewParameterManifest({ manifest: raw, files: files(raw) })
  expect(
    findParameterVariant(m, { resistor: "10k", header: false })
      ?.circuitJsonPath,
  ).toBe("dist/false-10k/circuit.json.gz")
  expect(
    findParameterVariant(m, { resistor: "47k", header: false }),
  ).toBeUndefined()
  expect(parameterStateKey({ a: 1, b: false })).toBe(
    parameterStateKey({ b: false, a: 1 }),
  )
})
test("rejects invalid defaults, duplicate states, unsafe paths, and artifacts outside the release", () => {
  for (const change of [
    (m: ReturnType<typeof manifest>) => {
      m.defaults.resistor = "47k"
    },
    (m: ReturnType<typeof manifest>) => {
      m.variants[1] = m.variants[0]
    },
    (m: ReturnType<typeof manifest>) => {
      m.bundlePath = "dist/../outside"
    },
    (m: ReturnType<typeof manifest>) => {
      m.parameters[1].options!.reverse()
    },
    (m: ReturnType<typeof manifest>) => {
      m.variants[0].glbPath = "dist/missing.glb"
    },
  ]) {
    const raw = manifest()
    const listed = files(raw)
    change(raw)
    expect(() =>
      parsePreviewParameterManifest({ manifest: raw, files: listed }),
    ).toThrow()
  }
})
test("loads a compressed circuit bundle and rejects incomplete combined states", async () => {
  const raw = manifest()
  const m = parsePreviewParameterManifest({ manifest: raw, files: files(raw) })
  const bundle = Object.fromEntries(
    m.variants.map((v) => [v.circuitJsonPath, [{ type: "pcb_board" }]]),
  )
  const fetchArtifact = spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(gzipSync(JSON.stringify(bundle))),
  )
  try {
    const result = await downloadPreviewCircuitBundle({
      apiBaseUrl: "https://registry.test",
      packageFileId: "bundle",
      manifest: m,
    })
    expect(Object.keys(result)).toHaveLength(4)
    delete bundle[m.variants[0].circuitJsonPath]
    fetchArtifact.mockResolvedValueOnce(
      new Response(gzipSync(JSON.stringify(bundle))),
    )
    await expect(
      downloadPreviewCircuitBundle({
        apiBaseUrl: "https://registry.test",
        packageFileId: "bundle",
        manifest: m,
      }),
    ).rejects.toThrow("Invalid parameter circuit bundle")
  } finally {
    fetchArtifact.mockRestore()
  }
})

test("v2 fetch contract derives all fields from the published schema without parameters metadata", () => {
  const schema = {
    type: "object",
    properties: {
      turbo: { type: "boolean", default: false },
      level: { type: "integer", minimum: 1, maximum: 2, default: 1 },
      revision: { const: "B" },
    },
  }
  const raw = {
    version: 2,
    propsSchemaPath: "dist/props.schema.json",
    componentPartNumbers: ["EXAMPLE123"],
    bundlePath: "dist/bundle.gz",
    variants: [false, true].flatMap((turbo) =>
      [1, 2].map((level) => ({
        values: { turbo, level, revision: "B" },
        circuitJsonPath: `dist/${turbo}-${level}.json.gz`,
        glbPath: "dist/3d.glb",
      })),
    ),
  }
  const listed = [
    raw.propsSchemaPath,
    raw.bundlePath,
    "dist/3d.glb",
    ...raw.variants.map((v) => v.circuitJsonPath),
  ].map((file_path) => ({ file_path }))
  const parsed = parsePreviewParameterManifest({
    manifest: raw,
    files: listed,
    propsSchema: schema,
  })
  expect(parsed.parameters.map((p) => [p.id, p.type])).toEqual([
    ["turbo", "boolean"],
    ["level", "number"],
  ])
  expect(parsed.defaults).toEqual({ turbo: false, level: 1, revision: "B" })
  expect(() =>
    parsePreviewParameterManifest({ manifest: raw, files: listed }),
  ).toThrow(/schema/)
  expect(() =>
    parsePreviewParameterManifest({
      manifest: { ...raw, variants: raw.variants.slice(1) },
      files: listed,
      propsSchema: schema,
    }),
  ).toThrow(/combination/)
  expect(() =>
    parsePreviewParameterManifest({
      manifest: raw,
      files: listed.filter((f) => f.file_path !== raw.propsSchemaPath),
      propsSchema: schema,
    }),
  ).toThrow(/artifacts/)
  const changed = structuredClone(raw)
  changed.variants[0].values.level = 9
  expect(() =>
    parsePreviewParameterManifest({
      manifest: changed,
      files: listed,
      propsSchema: schema,
    }),
  ).toThrow(/state/)
})
