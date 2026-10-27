import { expect, test } from "bun:test"
import { createHash } from "node:crypto"
import JSZip from "jszip"
import {
  downloadNativeKicadProject,
  nativeKicadCircuitText,
} from "../src/lib/download-fns/native-kicad-project"

const sha = (data: Uint8Array | string) =>
  createHash("sha256").update(data).digest("hex")
async function fixture(missing?: string) {
  const zip = new JSZip()
  for (const extension of ["kicad_pro", "kicad_pcb", "kicad_sch"]) {
    if (extension !== missing)
      zip.file(`native.${extension}`, `native ${extension}`)
  }
  zip.file("child.kicad_sch", "retained native child schematic")
  const bytes = await zip.generateAsync({ type: "uint8array" })
  const circuit: any[] = [
    { type: "pcb_board", width: 10, height: 20 },
    { type: "source_project_metadata" },
  ]
  circuit[1].native_kicad_project = {
    url: "https://example.com/native.zip",
    sha256: sha(bytes),
    project_file: "native.kicad_pro",
    circuit_json_sha256: sha(nativeKicadCircuitText(circuit)),
  }
  let calls = 0
  const fetchFile = (async (_url: unknown, options: RequestInit) => {
    calls++
    expect(options.credentials).toBe("omit")
    return new Response(bytes)
  }) as typeof fetch
  return { bytes, circuit, fetchFile, calls: () => calls }
}
test("native download preserves exact ZIP bytes and every project member", async () => {
  const f = await fixture()
  const blob = await downloadNativeKicadProject(f.circuit, f.fetchFile)
  expect(sha(new Uint8Array(await blob!.arrayBuffer()))).toBe(sha(f.bytes))
  expect(
    (await JSZip.loadAsync(await blob!.arrayBuffer())).file("child.kicad_sch"),
  ).not.toBeNull()
  expect(f.calls()).toBe(1)
})
test("no declaration retains the normal converter path without fetching", async () => {
  const f = await fixture()
  expect(await downloadNativeKicadProject([], f.fetchFile)).toBeNull()
  expect(f.calls()).toBe(0)
})
test("stale viewer data is rejected before a network request", async () => {
  const f = await fixture()
  f.circuit[0].width = 12
  await expect(
    downloadNativeKicadProject(f.circuit, f.fetchFile),
  ).rejects.toThrow("does not match this circuit revision")
  expect(f.calls()).toBe(0)
})
test("changed archive bytes are rejected, never silently regenerated", async () => {
  const f = await fixture()
  await expect(
    downloadNativeKicadProject(
      f.circuit,
      (async () => new Response("corrupt")) as typeof fetch,
    ),
  ).rejects.toThrow("SHA-256 mismatch")
})
test("incomplete and unavailable native projects fail", async () => {
  const f = await fixture("kicad_pro")
  await expect(
    downloadNativeKicadProject(f.circuit, f.fetchFile),
  ).rejects.toThrow("Incomplete native KiCad project")
  await expect(
    downloadNativeKicadProject(
      f.circuit,
      (async () => new Response("missing", { status: 404 })) as typeof fetch,
    ),
  ).rejects.toThrow("HTTP 404")
})
test("malformed, ambiguous and credentialed declarations fail closed", async () => {
  const f = await fixture()
  await expect(
    downloadNativeKicadProject([...f.circuit, f.circuit[1]], f.fetchFile),
  ).rejects.toThrow("Multiple")
  for (const url of [
    "http://example.com/native.zip",
    "https://user:password@example.com/native.zip",
  ]) {
    f.circuit[1].native_kicad_project.url = url
    await expect(
      downloadNativeKicadProject(f.circuit, f.fetchFile),
    ).rejects.toThrow("HTTPS URL without credentials")
  }
  f.circuit[1].native_kicad_project = null
  await expect(
    downloadNativeKicadProject(f.circuit, f.fetchFile),
  ).rejects.toThrow("Invalid native")
  expect(f.calls()).toBe(0)
})
test("canonical binding ignores key order and the CLI cache key only", async () => {
  const f = await fixture()
  const changed = [
    { height: 20, width: 10, type: "pcb_board" },
    { ...f.circuit[1], source_filesystem_md5_hash: "new-cache" },
  ]
  expect(nativeKicadCircuitText(changed)).toBe(
    nativeKicadCircuitText(f.circuit),
  )
  expect(await downloadNativeKicadProject(changed, f.fetchFile)).not.toBeNull()
})

test("archive path traversal is rejected even with a matching digest", async () => {
  const f = await fixture()
  const zip = await JSZip.loadAsync(f.bytes)
  zip.file("../outside.txt", "invalid archive member")
  const bytes = await zip.generateAsync({ type: "uint8array" })
  f.circuit[1].native_kicad_project.sha256 = sha(bytes)
  await expect(
    downloadNativeKicadProject(
      f.circuit,
      (async () => new Response(bytes)) as typeof fetch,
    ),
  ).rejects.toThrow("Unsafe native KiCad archive path")
})
