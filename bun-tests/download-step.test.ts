import { beforeEach, expect, mock, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"

const convert = mock(
  async (_circuit: AnyCircuitElement[], _options: unknown) =>
    "ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;",
)
const saveAs = mock((_blob: Blob, _name: string) => {})
const loading = mock((_message: string) => "step-download")
const dismiss = mock((_id: string) => {})

mock.module("@/lib/utils/load-internal-dynamic-modules", () => ({
  loadCircuitJsonToStep: async () => ({ circuitJsonToStep: convert }),
}))
mock.module("file-saver", () => ({ saveAs }))
mock.module("react-hot-toast", () => ({ default: { loading, dismiss } }))

const { downloadStepFile } = await import("@/lib/download-fns/download-step")

beforeEach(() => {
  convert.mockClear()
  saveAs.mockClear()
  loading.mockClear()
  dismiss.mockClear()
})

test("STEP downloads the complete visible circuit as one assembly file", async () => {
  const circuit = [
    { type: "pcb_board", pcb_board_id: "board", width: 20, height: 10 },
    {
      type: "source_component",
      source_component_id: "case",
      ftype: "printedpart",
      name: "Case",
    },
  ] as AnyCircuitElement[]
  await downloadStepFile(circuit, "device")

  expect(convert).toHaveBeenCalledWith(circuit, {
    exportMode: "assembly",
    productName: "device",
    includeComponents: true,
    includeExternalMeshes: true,
  })
  expect(saveAs).toHaveBeenCalledTimes(1)
  const [blob, filename] = saveAs.mock.calls[0]!
  expect(filename).toBe("device.step")
  expect(blob.type).toStartWith("text/plain")
  expect(await blob.text()).toStartWith("ISO-10303-21;")
  expect(dismiss).toHaveBeenCalledWith("step-download")
})

test("a failed conversion does not download a file and dismisses progress", async () => {
  convert.mockRejectedValueOnce(new Error("Unsupported CAD geometry"))
  await expect(downloadStepFile([], "device")).rejects.toThrow(
    "Unsupported CAD geometry",
  )
  expect(saveAs).not.toHaveBeenCalled()
  expect(dismiss).toHaveBeenCalledWith("step-download")
})

test("an older per-part converter cannot silently produce an invalid STEP download", async () => {
  convert.mockResolvedValueOnce({ "Case.step": "part" } as unknown as string)
  await expect(downloadStepFile([], "device")).rejects.toThrow(
    "Unable to create a complete STEP assembly",
  )
  expect(saveAs).not.toHaveBeenCalled()
})

test("package STEP assets are passed to the assembly converter", async () => {
  const fsMap = { "./models/chip.step": "ISO-10303-21;" }
  await downloadStepFile([], "device", { fsMap })
  expect(convert.mock.calls[0]![1]).toEqual({
    exportMode: "assembly",
    productName: "device",
    includeComponents: true,
    includeExternalMeshes: true,
    fsMap,
  })
})
