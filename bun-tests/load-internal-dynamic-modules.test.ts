import { expect, test } from "bun:test"
import { setDynamicImportResolver } from "@tscircuit/internal-dynamic-import"
import { loadCircuitJsonToKicad } from "@/lib/utils/load-internal-dynamic-modules"

test("failed converter loads can retry while pending and successful loads are shared", async () => {
  const previousResolver = globalThis.tscircuitDynamicImportResolver
  const loadError = new Error("Temporary converter download failure")
  const loadedModule = {}
  let attempts = 0
  let finishLoad!: (value: unknown) => void
  const pendingLoad = new Promise((resolve) => {
    finishLoad = resolve
  })

  setDynamicImportResolver((specifier, fallback) => {
    if (specifier !== "circuit-json-to-kicad") return fallback(specifier)
    attempts++
    if (attempts === 1) throw loadError
    return pendingLoad
  })

  try {
    const failed = await Promise.allSettled([
      loadCircuitJsonToKicad(),
      loadCircuitJsonToKicad(),
    ])
    expect(failed).toEqual([
      { status: "rejected", reason: loadError },
      { status: "rejected", reason: loadError },
    ])
    expect(attempts).toBe(1)

    const retries = Promise.allSettled([
      loadCircuitJsonToKicad(),
      loadCircuitJsonToKicad(),
    ])
    finishLoad(loadedModule)
    const results = await retries
    expect(results.map((result) => result.status)).toEqual([
      "fulfilled",
      "fulfilled",
    ])
    for (const result of results) {
      if (result.status === "fulfilled") {
        expect(result.value === loadedModule).toBe(true)
      }
    }
    expect(attempts).toBe(2)

    expect((await loadCircuitJsonToKicad()) === loadedModule).toBe(true)
    expect(attempts).toBe(2)
  } finally {
    setDynamicImportResolver(previousResolver)
  }
})
