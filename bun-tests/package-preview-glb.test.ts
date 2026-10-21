import { afterEach, expect, spyOn, test } from "bun:test"
import {
  downloadPackagePreviewGlb,
  findPackagePreviewGlb,
} from "@/lib/package-preview-glb"

const file = (file_path: string, package_file_id = file_path) => ({
  file_path,
  package_file_id,
})
const spies: { mockRestore(): void }[] = []
afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore()
})
const bytes = () => {
  const buffer = new ArrayBuffer(32)
  const header = new DataView(buffer)
  header.setUint32(0, 0x46546c67, true)
  header.setUint32(4, 2, true)
  header.setUint32(8, buffer.byteLength, true)
  return buffer
}

test("selects the assembly for the current preview, not archives or imported models", () => {
  const files = [
    file("archive/v1/previews/3d.glb"),
    file("imports/chip/3d.glb"),
    file("dist/other/3d.glb"),
    file("dist/index/3d.glb"),
    file("dist/published/3d.glb"),
  ]
  expect(
    findPackagePreviewGlb(files, "published.circuit.json")?.file_path,
  ).toBe("dist/published/3d.glb")
  expect(findPackagePreviewGlb(files, "index.circuit.tsx")?.file_path).toBe(
    "dist/index/3d.glb",
  )
  expect(findPackagePreviewGlb(files)?.file_path).toBe("dist/index/3d.glb")
  expect(findPackagePreviewGlb(files, "missing.tsx")).toBeUndefined()
  expect(findPackagePreviewGlb(files.slice(0, 3))).toBeUndefined()
  expect(
    findPackagePreviewGlb(
      [file("/dist/src/main.circuit/3d.glb")],
      "src/main.circuit.tsx",
    )?.file_path,
  ).toBe("/dist/src/main.circuit/3d.glb")
  expect(findPackagePreviewGlb([file("dist/3d.glb")])?.file_path).toBe(
    "dist/3d.glb",
  )
  expect(findPackagePreviewGlb([file("3d.glb")])?.file_path).toBe("3d.glb")
})

test("downloads exactly the selected file with authorization and cancellation", async () => {
  const calls: Array<[string, RequestInit | undefined]> = []
  spies.push(
    spyOn(globalThis, "fetch").mockImplementation((async (url, options) => {
      calls.push([String(url), options])
      return new Response(bytes())
    }) as typeof fetch),
  )
  const controller = new AbortController()
  const result = await downloadPackagePreviewGlb({
    apiBaseUrl: "/api/",
    packageFileId: "release-2-glb",
    token: "test-token",
    signal: controller.signal,
  })
  expect(result.byteLength).toBe(32)
  expect(calls).toHaveLength(1)
  expect(calls[0][0]).toBe(
    "/api/package_files/download?package_file_id=release-2-glb",
  )
  expect(calls[0][1]?.headers).toEqual({ Authorization: "Bearer test-token" })
  controller.abort()
  expect(calls[0][1]?.signal?.aborted).toBe(true)
})

test("missing, denied, corrupt and truncated downloads reject so the caller can fall back", async () => {
  const spy = spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("missing", { status: 404 }),
  )
  spies.push(spy)
  const request = { apiBaseUrl: "/api", packageFileId: "missing" }
  await expect(downloadPackagePreviewGlb(request)).rejects.toThrow("404")
  spy.mockResolvedValue(new Response("denied", { status: 403 }))
  await expect(downloadPackagePreviewGlb(request)).rejects.toThrow("403")
  spy.mockResolvedValue(new Response("<html>error</html>"))
  await expect(downloadPackagePreviewGlb(request)).rejects.toThrow(
    "Invalid preview GLB",
  )
  const bad = bytes()
  new DataView(bad).setUint32(8, 100, true)
  spy.mockResolvedValue(new Response(bad))
  await expect(downloadPackagePreviewGlb(request)).rejects.toThrow(
    "Invalid preview GLB",
  )
})
