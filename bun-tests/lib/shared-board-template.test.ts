import { expect, test } from "bun:test"
import { gzipSync, strToU8 } from "fflate"
import { bytesToBase64 } from "@/lib/bytesToBase64"
import { decodeUrlHashToFsMap } from "@/lib/decodeUrlHashToFsMap"
import { getSnippetTemplate } from "@/lib/get-snippet-template"

test("the starter and legacy single-file boards survive shared editor links", () => {
  const { fsMap } = getSnippetTemplate("blank-circuit-board")
  const imports = Array.from(
    fsMap["index.tsx"].matchAll(/from "\.\/(imports\/[^"]+)"/g),
    ([, modulePath]) => modulePath + ".tsx",
  )
  expect(imports).toHaveLength(6)
  expect(Object.keys(fsMap).sort()).toEqual(["index.tsx", ...imports].sort())

  const hash = (text: string) =>
    "#data:application/gzip;base64," + bytesToBase64(gzipSync(strToU8(text)))
  const sharedProject = hash(JSON.stringify(fsMap))
  // Anonymous editor sessions persist their workspace in this fragment.
  expect(sharedProject.length).toBeLessThanOrEqual(8000)
  expect(decodeUrlHashToFsMap(sharedProject)).toEqual(fsMap)

  const legacy = "export default () => <board />"
  expect(decodeUrlHashToFsMap(hash(legacy))).toEqual({ "index.tsx": legacy })
  expect(
    decodeUrlHashToFsMap("#data:application/gzip;base64,broken"),
  ).toBeNull()
})
