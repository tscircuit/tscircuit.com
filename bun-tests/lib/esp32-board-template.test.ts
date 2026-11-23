import { expect, test } from "bun:test"
import { runAllChecks } from "@tscircuit/checks"
import { createCircuitWebWorker } from "@tscircuit/eval/worker"
import { getSnippetTemplate } from "@/lib/get-snippet-template"

test("the default and New Board templates render a routed ESP32 circuit", async () => {
  const template = getSnippetTemplate(undefined)
  expect(getSnippetTemplate("blank-circuit-board")).toEqual(template)

  const worker = await createCircuitWebWorker({
    webWorkerBlobUrl: import.meta.resolve("@tscircuit/eval/worker-entrypoint"),
    platform: { partsEngineDisabled: true },
  })
  try {
    await worker.executeWithFsMap({ fsMap: { "index.tsx": template.code } })
    await worker.renderUntilSettled()
    const circuit = await worker.getCircuitJson()

    expect(circuit).toContainEqual(
      expect.objectContaining({
        type: "source_component",
        manufacturer_part_number: "XIAO ESP32C3",
      }),
    )
    const sheet = circuit.find((el) => el.type === "schematic_sheet")
    expect(sheet).toBeDefined()
    expect(
      circuit.filter(
        (el) =>
          el.type === "schematic_component" &&
          el.schematic_sheet_id === sheet!.schematic_sheet_id,
      ),
    ).toHaveLength(4)
    expect(circuit.filter((el) => el.type === "pcb_trace")).toHaveLength(4)
    expect(circuit.filter((el) => /_(error|warning)$/.test(el.type))).toEqual(
      [],
    )
    expect(await runAllChecks(circuit)).toEqual([])
  } finally {
    await worker.kill()
  }
}, 15_000)
