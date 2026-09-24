import { afterEach, expect, spyOn, test } from "bun:test"
import { renderToString } from "react-dom/server"
import { usePackageModelAssets } from "@/hooks/use-package-model-assets"
import {
  getPackageFileLookupParams,
  loadPackageModelAssets,
  type ModelAssetRequest,
} from "@/lib/package-model-assets"

const request: ModelAssetRequest = {
  assetUrls: ["./models/chip.glb"],
  apiBaseUrl: "https://registry.example",
  author: "alice",
  packageName: "board",
  version: "1.2.3",
  token: "test-token",
}
const spies: Array<{ mockRestore(): void }> = []
afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore()
})
const track = <T extends { mockRestore(): void }>(spy: T): T => {
  spies.push(spy)
  return spy
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function Preview({ value }: { value: ModelAssetRequest }) {
  const { isLoading, resolveStaticAsset } = usePackageModelAssets(value)
  return (
    <span>
      {isLoading
        ? "loading"
        : resolveStaticAsset("https://models.example/chip.glb")}
    </span>
  )
}

test("cached circuit data waits for local model resolution on the first render", () => {
  expect(renderToString(<Preview value={request} />)).toBe(
    "<span>loading</span>",
  )
})

test("external-only models can mount immediately and retain their URL", () => {
  expect(
    renderToString(<Preview value={{ ...request, assetUrls: [] }} />),
  ).toContain("https://models.example/chip.glb")
})

test("external URLs bypass package lookups; local and dependency paths retain routing", () => {
  for (const assetUrl of [
    "https://cdn.example/chip.obj",
    "//cdn.example/chip.obj",
    "blob:local",
    "data:model/gltf-binary;base64,AA",
  ]) {
    expect(getPackageFileLookupParams({ ...request, assetUrl })).toBeNull()
  }
  expect(
    getPackageFileLookupParams({ ...request, assetUrl: "./models/chip.glb" }),
  ).toEqual({
    package_name_with_version: "alice/board@1.2.3",
    file_path: "models/chip.glb",
  })
  expect(
    getPackageFileLookupParams({
      ...request,
      releaseId: "release-1",
      assetUrl: "model.glb",
    }),
  ).toEqual({ package_release_id: "release-1", file_path: "model.glb" })
  expect(
    getPackageFileLookupParams({
      ...request,
      assetUrl: "node_modules/@tsci/bob.chip/model.glb",
    }),
  ).toEqual({
    package_name_with_version: "bob/chip@latest",
    file_path: "dist/model.glb",
  })
})

test("loads authenticated assets, normalizes aliases and revokes once on disposal", async () => {
  const fetchMock = track(
    spyOn(globalThis, "fetch").mockResolvedValue(new Response("model")),
  )
  const create = track(
    spyOn(URL, "createObjectURL").mockReturnValue("blob:test"),
  )
  const revoke = track(
    spyOn(URL, "revokeObjectURL").mockImplementation(() => {}),
  )
  const load = loadPackageModelAssets(request)
  expect(await load.promise).toEqual({
    "./models/chip.glb": "blob:test",
    "models/chip.glb": "blob:test",
  })
  expect(create).toHaveBeenCalledTimes(1)
  const options = fetchMock.mock.calls[0][1]!
  expect(options.headers).toEqual({ Authorization: "Bearer test-token" })
  load.dispose()
  load.dispose()
  expect(options.signal!.aborted).toBe(true)
  expect(revoke).toHaveBeenCalledTimes(1)
})

test("leaving during fetch aborts the request and creates no late blob URL", async () => {
  const pending = deferred<Response>()
  const fetchMock = track(
    spyOn(globalThis, "fetch").mockReturnValue(pending.promise),
  )
  const create = track(spyOn(URL, "createObjectURL"))
  const load = loadPackageModelAssets(request)
  load.dispose()
  expect(fetchMock.mock.calls[0][1]!.signal!.aborted).toBe(true)
  pending.resolve(new Response("model"))
  expect(await load.promise).toEqual({})
  expect(create).not.toHaveBeenCalled()
})

test("leaving while the response body is being read creates no late blob URL", async () => {
  const body = deferred<Blob>()
  const bodyStarted = deferred<void>()
  track(
    spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      blob: () => {
        bodyStarted.resolve()
        return body.promise
      },
    } as Response),
  )
  const create = track(spyOn(URL, "createObjectURL"))
  const load = loadPackageModelAssets(request)
  await bodyStarted.promise
  load.dispose()
  body.resolve(new Blob(["model"]))
  expect(await load.promise).toEqual({})
  expect(create).not.toHaveBeenCalled()
})

test("failed downloads settle so the viewer can use its original asset fallback", async () => {
  track(
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("missing", { status: 404 }),
    ),
  )
  const load = loadPackageModelAssets(request)
  expect(await load.promise).toEqual({})
  load.dispose()
})
