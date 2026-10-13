import { afterEach, expect, spyOn, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { withResolvedModelAssets } from "@/lib/with-resolved-model-assets"

const originalFetch = globalThis.fetch
const spies: Array<{ mockRestore(): void }> = []
afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore()
})
const track = <T extends { mockRestore(): void }>(spy: T): T => {
  spies.push(spy)
  return spy
}
const cad = (
  models: Record<string, string>,
  id = "chip",
): AnyCircuitElement[] =>
  [
    {
      type: "cad_component",
      cad_component_id: `cad-${id}`,
      source_component_id: id,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      ...models,
    },
  ] as AnyCircuitElement[]

const request = {
  apiBaseUrl: "https://registry.example",
  releaseId: "release-1",
  token: "test-token",
  preserveStepUrls: true,
}

test("STEP retains original paths with authenticated assets from the viewed release", async () => {
  const circuit = [
    ...cad({ model_step_url: "./models/chip.step" }),
    ...cad({ model_glb_url: "./models/chip.glb" }, "body"),
  ]
  const original = structuredClone(circuit)
  const fetchSpy = track(
    spyOn(globalThis, "fetch").mockImplementation((async (input, init) =>
      String(input).startsWith("blob:")
        ? originalFetch(input, init)
        : new Response(
            String(input).includes("chip.step") ? "STEP contents" : "GLB",
          )) as typeof fetch),
  )
  const revoke = track(spyOn(URL, "revokeObjectURL"))

  await withResolvedModelAssets(circuit, request, async (resolved, fsMap) => {
    const model = resolved[0] as any
    expect(model.model_step_url).toBe("./models/chip.step")
    expect((resolved[1] as any).model_glb_url).toStartWith("blob:")
    expect(fsMap).toEqual({ "./models/chip.step": "STEP contents" })
    expect(revoke).not.toHaveBeenCalled()
  })
  const packageCalls = fetchSpy.mock.calls.filter(
    ([url]) => !String(url).startsWith("blob:"),
  )
  expect(packageCalls).toHaveLength(2)
  for (const [input, init] of packageCalls) {
    const url = new URL(String(input))
    expect(url.searchParams.get("package_release_id")).toBe("release-1")
    expect(url.searchParams.has("package_name_with_version")).toBe(false)
    expect(init?.headers).toEqual({ Authorization: "Bearer test-token" })
  }
  expect(revoke).toHaveBeenCalledTimes(2)
  expect(circuit).toEqual(original)
})

test("GLB resolves STEP URLs to readable blobs for its mesh loader", async () => {
  const circuit = cad({ model_step_url: "./models/chip.step" })
  await withResolvedModelAssets(
    circuit,
    {
      ...request,
      preserveStepUrls: false,
      fsMap: { "models/chip.step": "unsaved STEP" },
    },
    async (resolved) => {
      const blobUrl = (resolved[0] as any).model_step_url
      expect(blobUrl).toStartWith("blob:")
      expect(await (await originalFetch(blobUrl)).text()).toBe("unsaved STEP")
    },
  )
  expect((circuit[0] as any).model_step_url).toBe("./models/chip.step")
})

test("new editor files override registry data and their blobs survive until export ends", async () => {
  const fetchSpy = track(spyOn(globalThis, "fetch"))
  const revoke = track(spyOn(URL, "revokeObjectURL"))
  const circuit = [
    ...cad({ model_step_url: "./case.step" }),
    ...cad({ model_obj_url: "case.obj" }, "body"),
  ]
  await withResolvedModelAssets(
    circuit,
    {
      apiBaseUrl: "/api",
      fsMap: { "case.step": "new STEP", "case.obj": "new OBJ" },
      preserveStepUrls: true,
    },
    async (resolved, fsMap) => {
      expect(fsMap).toEqual({ "./case.step": "new STEP" })
      expect(
        await (await originalFetch((resolved[1] as any).model_obj_url)).text(),
      ).toBe("new OBJ")
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(revoke).not.toHaveBeenCalled()
    },
  )
  expect(revoke).toHaveBeenCalledTimes(2)
})

test("missing package assets prevent an incomplete export and dispose loaded assets", async () => {
  track(
    spyOn(globalThis, "fetch").mockImplementation((async (input) =>
      String(input).includes("missing")
        ? new Response("missing", { status: 404 })
        : new Response("GLB")) as typeof fetch),
  )
  const revoke = track(spyOn(URL, "revokeObjectURL"))
  let exported = false
  await expect(
    withResolvedModelAssets(
      [
        ...cad({ model_glb_url: "loaded.glb" }),
        ...cad({ model_step_url: "missing.step" }, "missing"),
      ],
      request,
      async () => {
        exported = true
      },
    ),
  ).rejects.toThrow("Unable to load model asset: missing.step")
  expect(exported).toBe(false)
  expect(revoke).toHaveBeenCalledTimes(1)
})

test("STEP uses JSCAD without fetching unused or unsupported model alternatives", async () => {
  const circuit = cad({
    model_step_url: "missing.step",
    model_3mf_url: "missing.3mf",
  })
  ;(circuit[0] as any).model_jscad = { type: "cuboid", size: [4, 5, 6] }
  const fetchSpy = track(spyOn(globalThis, "fetch"))
  await withResolvedModelAssets(
    circuit,
    { apiBaseUrl: "/api", preserveStepUrls: true },
    async (resolved, fsMap) => {
      expect(resolved).toEqual(circuit)
      expect(fsMap).toEqual({})
    },
  )
  expect(fetchSpy).not.toHaveBeenCalled()
})

test("GLB resolves its active URL and ignores unavailable STEP and unsupported alternatives", async () => {
  const circuit = cad({
    model_glb_url: "chip.glb",
    model_step_url: "missing.step",
    model_3mf_url: "missing.3mf",
  })
  const fetchSpy = track(
    spyOn(globalThis, "fetch").mockResolvedValue(new Response("GLB")),
  )
  await withResolvedModelAssets(
    circuit,
    { ...request, preserveStepUrls: false },
    async (resolved) => {
      const model = resolved[0] as any
      expect(model.model_glb_url).toStartWith("blob:")
      expect(model.model_step_url).toBe("missing.step")
      expect(model.model_3mf_url).toBe("missing.3mf")
    },
  )
  expect(fetchSpy).toHaveBeenCalledTimes(1)
  expect(String(fetchSpy.mock.calls[0]![0])).toContain("file_path=chip.glb")
})

test("STEP prefers its STEP geometry over unused mesh alternatives", async () => {
  const circuit = cad({
    model_step_url: "chip.step",
    model_stl_url: "missing.stl",
    model_glb_url: "missing.glb",
  })
  const fetchSpy = track(spyOn(globalThis, "fetch"))
  await withResolvedModelAssets(
    circuit,
    { ...request, fsMap: { "chip.step": "STEP contents" } },
    async (resolved, fsMap) => {
      expect(resolved).toEqual(circuit)
      expect(fsMap).toEqual({ "chip.step": "STEP contents" })
    },
  )
  expect(fetchSpy).not.toHaveBeenCalled()
})

test("GLTF supported URL priority is retained when inline JSCAD is also present", async () => {
  const circuit = cad({
    model_stl_url: "chip.stl",
    model_obj_url: "missing.obj",
    model_gltf_url: "missing.gltf",
    model_glb_url: "missing.glb",
  })
  ;(circuit[0] as any).model_jscad = { type: "cuboid", size: [4, 5, 6] }
  const fetchSpy = track(
    spyOn(globalThis, "fetch").mockResolvedValue(new Response("STL")),
  )
  await withResolvedModelAssets(
    circuit,
    { ...request, preserveStepUrls: false },
    async (resolved) => {
      const model = resolved[0] as any
      expect(model.model_stl_url).toStartWith("blob:")
      expect(model.model_obj_url).toBe("missing.obj")
      expect(model.model_jscad).toEqual((circuit[0] as any).model_jscad)
    },
  )
  expect(fetchSpy).toHaveBeenCalledTimes(1)
  expect(String(fetchSpy.mock.calls[0]![0])).toContain("file_path=chip.stl")
})

test("conversion failure still disposes all loaded blobs", async () => {
  track(spyOn(globalThis, "fetch").mockResolvedValue(new Response("GLB")))
  const revoke = track(spyOn(URL, "revokeObjectURL"))
  await expect(
    withResolvedModelAssets(
      cad({ model_glb_url: "chip.glb" }),
      request,
      async () => {
        throw new Error("conversion failed")
      },
    ),
  ).rejects.toThrow("conversion failed")
  expect(revoke).toHaveBeenCalledTimes(1)
})

test("absolute models remain unchanged and unresolvable relative assets report an error", async () => {
  const circuit = cad({ model_step_url: "https://cdn.example/chip.step" })
  const fetchSpy = track(spyOn(globalThis, "fetch"))
  await withResolvedModelAssets(
    circuit,
    { apiBaseUrl: "/api" },
    async (resolved, fsMap) => {
      expect(resolved).toEqual(circuit)
      expect(fsMap).toEqual({})
    },
  )
  expect(fetchSpy).not.toHaveBeenCalled()
  await expect(
    withResolvedModelAssets(
      cad({ model_step_url: "chip.step" }),
      { apiBaseUrl: "/api" },
      async () => {},
    ),
  ).rejects.toThrow("Unable to resolve model asset: chip.step")
})
