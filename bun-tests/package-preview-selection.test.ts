import { expect, test } from "bun:test"
import { getPackagePreviewUrl } from "@/lib/package-file-routes"
import { readPackagePreviewSelection } from "@/lib/package-preview-selection"

test("preview links use ordinary package file/release parameters and view hashes", () => {
  const query = new URLSearchParams({
    package_release_id: "release-a",
    preview_file: "dist/states/test/circuit.json.gz",
    schematic_sheet: "power",
  })
  expect(readPackagePreviewSelection(`?${query}#pcb`)).toEqual({
    release: "release-a",
    file: "dist/states/test/circuit.json.gz",
    sheet: "power",
    view: "pcb",
  })
  expect(
    readPackagePreviewSelection("?package_release_id=release-b#3d"),
  ).toEqual({
    release: "release-b",
    file: undefined,
    sheet: undefined,
    view: "3d",
  })
  expect(readPackagePreviewSelection("#unknown").view).toBe("schematic")
  expect(readPackagePreviewSelection("").view).toBe("schematic")
})

test("customize links preserve package identity, release, configuration, view and sheet", () => {
  const selection = {
    release: "release-123",
    file: "dist/states/supply/circuit.json.gz",
    sheet: "power",
    view: "pcb",
  }
  const href = getPackagePreviewUrl({
    author: "test user",
    packageName: "board",
    selection,
    customize: true,
  })
  const url = new URL(href, "https://tscircuit.com")
  expect(url.pathname).toBe("/test%20user/board/customize")
  expect(url.searchParams.get("package_release_id")).toBe(selection.release)
  expect(url.searchParams.get("preview_file")).toBe(selection.file)
  expect(url.searchParams.get("schematic_sheet")).toBe("power")
  expect(url.hash).toBe("#pcb")
  expect(
    getPackagePreviewUrl({
      author: "test user",
      packageName: "board",
      selection,
    }),
  ).not.toContain("/customize")
  expect(
    getPackagePreviewUrl({
      author: "maker",
      packageName: "board",
      selection: { view: "files" },
      customize: true,
    }),
  ).toBe("/maker/board/customize#schematic")
})
