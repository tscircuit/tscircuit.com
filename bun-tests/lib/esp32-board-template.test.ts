import { expect, test } from "bun:test"
import { runAllChecks } from "@tscircuit/checks"
import { createCircuitWebWorker } from "@tscircuit/eval/worker"
import { getSnippetTemplate } from "@/lib/get-snippet-template"

test("the default and New Board templates render a USB-programmable ESP32 Wi-Fi sounder", async () => {
  const template = getSnippetTemplate(undefined)
  expect(getSnippetTemplate("blank-circuit-board")).toEqual(template)

  const worker = await createCircuitWebWorker({
    webWorkerBlobUrl: new URL(
      "../fixtures/esp32-template-worker.ts",
      import.meta.url,
    ).href,
    platform: { partsEngineDisabled: true },
  })
  try {
    await worker.executeWithFsMap({ fsMap: { "index.tsx": template.code } })
    await worker.renderUntilSettled()
    const circuit = await worker.getCircuitJson()
    const parts = circuit.filter((el) => el.type === "source_component")
    const models = circuit.filter((el) => el.type === "cad_component")
    for (const mpn of [
      "ESP32-C3-WROOM-02-N4",
      "10118194-0001LF",
      "LM4861MX/NOPB",
      "CPT-9019S-SMT-TR",
    ]) {
      const part = parts.find((el) => el.manufacturer_part_number === mpn)
      expect(part).toBeDefined()
      const model = models.find(
        (el) => el.source_component_id === part!.source_component_id,
      )
      expect(model?.model_obj_url).toContain(
        part!.supplier_part_numbers!.jlcpcb![0],
      )
    }

    // Check package pin numbers, independent of the labels in the template.
    const names = new Map(parts.map((p) => [p.source_component_id, p.name]))
    const nets = new Map<string, string>()
    for (const port of circuit) {
      if (
        port.type !== "source_port" ||
        !port.source_component_id ||
        !port.subcircuit_connectivity_map_key
      )
        continue
      const pin = names.get(port.source_component_id) + "." + port.pin_number
      nets.set(pin, port.subcircuit_connectivity_map_key)
    }
    const groups = [
      ["J1.1", "U2.1", "U2.3", "U3.6"], // VBUS
      ["U2.5", "U1.1", "C3.1", "C4.1"], // 3.3 V
      ["J1.5", "J1.6", "U1.9", "U1.19", "U2.2", "U3.7", "U3.1"], // GND
      ["U1.2", "R3.2", "C5.1"], // enable timing
      ["U1.8", "R4.2", "SW1.1"], // download mode
      ["J1.2", "R1.2"],
      ["R1.1", "U1.13"], // USB D− to GPIO18
      ["J1.3", "R2.2"],
      ["R2.1", "U1.14"], // USB D+ to GPIO19
      ["U1.3", "C6.1"],
      ["C6.2", "R7.1"], // GPIO4 to amplifier input
      ["R7.2", "R8.1", "U3.4"],
      ["U3.2", "U3.3", "C7.1"],
      ["U3.5", "R8.2", "R9.1"],
      ["R9.2", "Y1.1"],
      ["U3.8", "Y1.2"],
    ]
    for (const group of groups) {
      const net = nets.get(group[0])
      expect(net).toBeDefined()
      for (const pin of group.slice(1)) expect(nets.get(pin)).toBe(net)
    }
    expect(new Set(groups.map(([pin]) => nets.get(pin))).size).toBe(
      groups.length,
    )

    expect(circuit.some((el) => el.type === "pcb_trace")).toBe(true)
    expect(
      circuit.some(
        (el) => el.type === "pcb_copper_pour" && el.layer === "bottom",
      ),
    ).toBe(true)
    expect(circuit).toContainEqual(
      expect.objectContaining({
        type: "pcb_keepout",
        layers: ["top", "bottom"],
      }),
    )
    expect(circuit.filter((el) => /_(error|warning)$/.test(el.type))).toEqual(
      [],
    )
    expect(await runAllChecks(circuit)).toEqual([])
  } finally {
    await worker.kill()
  }
}, 30_000)
