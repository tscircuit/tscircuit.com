/** Reusable package postbuild: configuration fields come only from propsJsonSchema. */
import { RootCircuit } from "tscircuit"
import React from "react"
import { createHash } from "node:crypto"
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join, resolve, relative } from "node:path"
import { tmpdir } from "node:os"
import { pathToFileURL } from "node:url"
import { gzipSync } from "node:zlib"
import {
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import {
  enumeratePackageStates,
  type PackagePropsSchema,
} from "./package-props-schema"

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex")
const stateId = (props: Record<string, unknown>) =>
  digest(
    Object.keys(props)
      .sort()
      .map((key) => [key, props[key]]),
  ).slice(0, 16)
const fingerprint = (json: any[]) =>
  digest([
    json.filter(
      (e) =>
        (e.type.startsWith("pcb_") &&
          !["pcb_trace", "pcb_via", "pcb_port"].includes(e.type)) ||
        e.type === "cad_component",
    ),
    json.filter((e) => e.type === "source_trace" || e.type === "source_net"),
    json
      .filter((e) => e.type === "source_port")
      .map((e) => [
        e.source_port_id,
        e.source_component_id,
        e.pin_number,
        e.subcircuit_connectivity_map_key,
      ]),
  ])
const assertCircuit = (json: any[], id: string) => {
  if (
    json.some(
      (e) => e.type.endsWith("_error") || /^schematic_.*warning$/.test(e.type),
    )
  )
    throw new Error(
      `Preview state ${id} contains circuit errors or schematic warnings`,
    )
}

export async function buildPackagePreview({
  root,
  maxStates = 256,
}: { root: string; maxStates?: number }) {
  root = resolve(root)
  const config = JSON.parse(
    await readFile(join(root, "tscircuit.config.json"), "utf8"),
  )
  const entrypoint: string = config.mainEntrypoint
  if (!entrypoint || relative(root, resolve(root, entrypoint)).startsWith(".."))
    throw new Error("A project-local mainEntrypoint is required")
  const source = await import(pathToFileURL(join(root, entrypoint)).href)
  const Reference = source.default
  const schema: PackagePropsSchema = source.propsJsonSchema
  if (typeof Reference !== "function" || !schema)
    throw new Error(
      "Export the circuit and its canonical propsJsonSchema from mainEntrypoint",
    )
  const generated = enumeratePackageStates(schema, maxStates)
  const defaults = generated.defaults
  const states = [
    defaults,
    ...generated.states.filter((props) => stateId(props) !== stateId(defaults)),
  ]
  const stem = entrypoint
    .replaceAll("\\", "/")
    .replace(/(\.board|\.circuit)?\.tsx$/, "")
    .replace(/\.circuit\.json$/, "")
  const nativeDirectory = `dist/${stem}`
  const nativeOutput = join(root, nativeDirectory)
  const original = JSON.parse(
    await readFile(join(nativeOutput, "circuit.json"), "utf8"),
  )
  assertCircuit(original, "default")
  const defaultFingerprint = fingerprint(original)
  const bases = new Map<string, { json: any[]; glb: Uint8Array }>([
    [
      defaultFingerprint,
      {
        json: original,
        glb: await readFile(join(nativeOutput, "3d.glb")),
      },
    ],
  ])
  const stage = await mkdtemp(join(tmpdir(), "package-preview-"))
  const models = new Map<string, string>()
  const bundle: Record<string, any[]> = {}
  const variants: {
    values: typeof defaults
    circuitJsonPath: string
    glbPath: string
  }[] = []
  const componentPartNumbers = new Set<string>()
  const write = async (path: string, data: string | Uint8Array) => {
    const file = join(stage, "generated", path)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, data)
  }
  try {
    for (const props of states) {
      const id = stateId(props)
      const circuit = new RootCircuit({
        platform: { partsEngineDisabled: true, routingDisabled: true },
      })
      circuit.add(React.createElement(Reference, props))
      await circuit.renderUntilSettled()
      const rendered = circuit.getCircuitJson() as any[]
      const key = fingerprint(rendered)
      let base = bases.get(key)
      if (!base) {
        const propsFile = join(stage, `${id}.json`)
        await writeFile(propsFile, JSON.stringify(props))
        console.log(`Building discovered physical layout ${bases.size + 1}`)
        const command = Bun.spawn(
          [
            process.execPath,
            join(root, "node_modules/@tscircuit/cli/dist/cli/main.js"),
            "build",
            entrypoint,
            "--disable-parts-engine",
            "--glbs",
            "--inject-props-file",
            propsFile,
          ],
          { cwd: root, stdout: "inherit", stderr: "inherit" },
        )
        if ((await command.exited) !== 0)
          throw new Error(`Native layout build failed for state ${id}`)
        base = {
          json: JSON.parse(
            await readFile(join(nativeOutput, "circuit.json"), "utf8"),
          ),
          glb: await readFile(join(nativeOutput, "3d.glb")),
        }
        assertCircuit(base.json, id)
        if (fingerprint(base.json) !== key)
          throw new Error(
            `Native geometry or connectivity differs from schema state ${id}; refusing layout reuse`,
          )
        bases.set(key, base)
      }
      if (!models.has(key)) {
        const path =
          key === defaultFingerprint
            ? `${nativeDirectory}/3d.glb`
            : `dist/preview-models/${key.slice(0, 16)}/3d.glb`
        await write(path, base.glb)
        models.set(key, path)
      }
      const json = [
        ...rendered.filter(
          (e) => !e.type.startsWith("pcb_") && e.type !== "cad_component",
        ),
        ...base.json.filter(
          (e) => e.type.startsWith("pcb_") || e.type === "cad_component",
        ),
      ]
      assertCircuit(json, id)
      for (const part of json.filter((e) => e.type === "source_component"))
        if (
          typeof part.manufacturer_part_number === "string" &&
          part.manufacturer_part_number
        )
          componentPartNumbers.add(part.manufacturer_part_number)
      const path =
        id === stateId(defaults)
          ? `${nativeDirectory}/circuit.json`
          : `${nativeDirectory}/states/${id}/circuit.json.gz`
      const text = JSON.stringify(json)
      await write(path, path.endsWith(".gz") ? gzipSync(text) : text)
      const directory = dirname(path)
      await write(
        `${directory}/schematic.svg`,
        convertCircuitJsonToSchematicSvg(json),
      )
      await write(`${directory}/pcb.svg`, convertCircuitJsonToPcbSvg(json))
      bundle[path] = json
      variants.push({
        values: props,
        circuitJsonPath: path,
        glbPath: models.get(key)!,
      })
      console.log(
        `Generated ${variants.length}/${states.length} exact states (${models.size} physical layouts)`,
      )
      Bun.gc(true)
    }
    await write("dist/props.schema.json", JSON.stringify(schema, null, 2))
    await write(
      "dist/preview-circuits.json.gz",
      gzipSync(JSON.stringify(bundle)),
    )
    await write(
      "dist/preview.json",
      JSON.stringify(
        {
          version: 2,
          propsSchemaPath: "dist/props.schema.json",
          componentPartNumbers: [...componentPartNumbers].sort(),
          bundlePath: "dist/preview-circuits.json.gz",
          variants,
        },
        null,
        2,
      ),
    )
    await rm(nativeOutput, { recursive: true, force: true })
    await rm(join(root, "dist/preview-models"), {
      recursive: true,
      force: true,
    })
    await cp(join(stage, "generated/dist"), join(root, "dist"), {
      recursive: true,
    })
    for (const format of ["esm", "cjs"] as const) {
      const result = await Bun.build({
        entrypoints: [join(root, entrypoint)],
        outdir: join(root, "dist"),
        naming: format === "esm" ? "index.js" : "index.cjs",
        target: "browser",
        format,
        external: ["react", "react/jsx-runtime", "tscircuit", "ajv", "zod"],
      })
      if (!result.success)
        throw new AggregateError(result.logs, "Component bundling failed")
    }
    console.log(
      `Verified ${states.length} generated states and ${models.size} native physical layouts`,
    )
  } finally {
    await rm(stage, { recursive: true, force: true })
  }
}
