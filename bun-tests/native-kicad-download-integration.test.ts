import { afterEach, expect, mock, spyOn, test } from "bun:test"
import { createHash } from "node:crypto"
import JSZip from "jszip"
import { nativeKicadCircuitText } from "../src/lib/download-fns/native-kicad-project"

const saveAs = mock(() => {})
const errorToast = mock(() => {})
const loadConverter = mock(async () => {
  class Converter {
    runUntilFinished() {}
    getOutputString() {
      return "generated"
    }
    getOutputFiles() {
      return [{ filename: "generated.kicad_sch", content: "generated" }]
    }
  }
  return {
    CircuitJsonToKicadPcbConverter: Converter,
    CircuitJsonToKicadSchConverter: Converter,
    CircuitJsonToKicadProConverter: Converter,
  }
})
mock.module("file-saver", () => ({ saveAs }))
mock.module("react-hot-toast", () => ({
  default: { loading: () => "id", dismiss: () => {}, error: errorToast },
}))
mock.module("@/lib/utils/load-internal-dynamic-modules", () => ({
  loadCircuitJsonToKicad: loadConverter,
}))
const { downloadKicadFiles } = await import(
  "../src/lib/download-fns/download-kicad-files"
)
afterEach(() => {
  mock.restore()
  saveAs.mockClear()
  errorToast.mockClear()
  loadConverter.mockClear()
})
const sha = (bytes: string | Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex")
async function fixture() {
  const zip = new JSZip()
  for (const extension of ["kicad_pro", "kicad_pcb", "kicad_sch"])
    zip.file(`native.${extension}`, "native")
  const bytes = await zip.generateAsync({ type: "uint8array" })
  const circuit: any[] = [{ type: "source_project_metadata" }]
  circuit[0].native_kicad_project = {
    url: "https://example.com/native.zip",
    sha256: sha(bytes),
    project_file: "native.kicad_pro",
    circuit_json_sha256: sha(nativeKicadCircuitText(circuit)),
  }
  return { bytes, circuit }
}

test("download action saves native bytes without loading converters", async () => {
  const f = await fixture()
  spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(Uint8Array.from(f.bytes).buffer),
  )
  await downloadKicadFiles(f.circuit, "package")
  expect(loadConverter).not.toHaveBeenCalled()
  expect(saveAs).toHaveBeenCalledTimes(1)
  const [blob, filename] = saveAs.mock.calls[0] as unknown as [Blob, string]
  expect(filename).toBe("package_kicad.zip")
  expect(sha(new Uint8Array(await blob.arrayBuffer()))).toBe(sha(f.bytes))
})

test("native download failure shows an error and never saves or converts", async () => {
  const f = await fixture()
  spyOn(globalThis, "fetch").mockResolvedValue(new Response("bad bytes"))
  await expect(downloadKicadFiles(f.circuit, "package")).rejects.toThrow(
    "SHA-256 mismatch",
  )
  expect(errorToast).toHaveBeenCalledTimes(1)
  expect(saveAs).not.toHaveBeenCalled()
  expect(loadConverter).not.toHaveBeenCalled()
})

test("ordinary packages still use the existing converters", async () => {
  await downloadKicadFiles([], "package")
  expect(loadConverter).toHaveBeenCalledTimes(1)
  const [blob] = saveAs.mock.calls[0] as unknown as [Blob]
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  expect(await zip.file("package.kicad_pcb")!.async("string")).toBe("generated")
})
