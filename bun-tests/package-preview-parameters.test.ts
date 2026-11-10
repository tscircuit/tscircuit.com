import { expect, test } from "bun:test"
import {
  parsePreviewParameterManifest,
  findParameterVariant,
  parameterStateKey,
  downloadPreviewCircuitBundle,
} from "@/lib/package-preview-parameters"
import { gzipSync } from "node:zlib"
const manifest = () => ({
  version: 1,
  parameters: [
    {
      id: "header",
      type: "boolean",
      label: "Header",
      description: "Fit header",
      default: true,
    },
    {
      id: "resistor",
      type: "number",
      label: "Pull-up",
      description: "Reset resistor",
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
  const m = parsePreviewParameterManifest(raw, files(raw))
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
    (m: any) => {
      m.defaults.resistor = "47k"
    },
    (m: any) => {
      m.variants[1] = m.variants[0]
    },
    (m: any) => {
      m.bundlePath = "dist/../outside"
    },
    (m: any) => {
      m.parameters[1].options.reverse()
    },
    (m: any) => {
      m.variants[0].glbPath = "dist/missing.glb"
    },
  ]) {
    const raw = manifest()
    const listed = files(raw)
    change(raw)
    expect(() => parsePreviewParameterManifest(raw, listed)).toThrow()
  }
})
test("loads a compressed circuit bundle and rejects incomplete combined states", async () => {
  const raw = manifest()
  const m = parsePreviewParameterManifest(raw, files(raw))
  const bundle = Object.fromEntries(
    m.variants.map((v) => [v.circuitJsonPath, [{ type: "pcb_board" }]]),
  )
  const original = globalThis.fetch
  try {
    globalThis.fetch = (async () =>
      new Response(gzipSync(JSON.stringify(bundle)))) as any
    const result = await downloadPreviewCircuitBundle({
      apiBaseUrl: "https://registry.test",
      packageFileId: "bundle",
      manifest: m,
    })
    expect(Object.keys(result)).toHaveLength(4)
    delete bundle[m.variants[0].circuitJsonPath]
    await expect(
      downloadPreviewCircuitBundle({
        apiBaseUrl: "https://registry.test",
        packageFileId: "bundle",
        manifest: m,
      }),
    ).rejects.toThrow("Invalid parameter circuit bundle")
  } finally {
    globalThis.fetch = original
  }
})
