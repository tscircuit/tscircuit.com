import { expect, test } from "bun:test"
import { getCurrentPackageFiles } from "@/lib/get-current-package-files"

test("excludes a stale path after a file is renamed", () => {
  const loadedFiles = new Map([
    ["old-name.tsx", { path: "old-name.tsx", content: "export default 1" }],
  ])
  const packageFiles = [{ file_path: "new-name.tsx" }]

  expect(getCurrentPackageFiles(packageFiles, loadedFiles)).toEqual([])

  loadedFiles.set("new-name.tsx", {
    path: "new-name.tsx",
    content: "export default 1",
  })

  const files = getCurrentPackageFiles(packageFiles, loadedFiles)

  expect(files).toEqual([{ path: "new-name.tsx", content: "export default 1" }])
})

test("returns loaded files in current package metadata order", () => {
  const loadedFiles = new Map([
    ["second.tsx", { path: "second.tsx", content: "second" }],
    ["deleted.tsx", { path: "deleted.tsx", content: "deleted" }],
    ["first.tsx", { path: "first.tsx", content: "first" }],
  ])

  const files = getCurrentPackageFiles(
    [{ file_path: "first.tsx" }, { file_path: "second.tsx" }],
    loadedFiles,
  )

  expect(files.map((file) => file.path)).toEqual(["first.tsx", "second.tsx"])
})
