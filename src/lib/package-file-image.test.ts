import { expect, test } from "bun:test"
import {
  getPackageFileImageKind,
  getPackageFileImageUrl,
} from "./package-file-image"

test("recognizes png and svg package file MIME types", () => {
  expect(getPackageFileImageKind("image/png")).toBe("png")
  expect(getPackageFileImageKind("image/svg+xml; charset=utf-8")).toBe("svg")
  expect(getPackageFileImageKind("text/plain")).toBeNull()
  expect(getPackageFileImageKind(null)).toBeNull()
})

test("builds a package file image URL", () => {
  expect(
    getPackageFileImageUrl({
      apiBaseUrl: "https://api.tscircuit.com/",
      packageFileId: "6e919e7d-1969-49c5-9092-4e2f9de592dc",
    }),
  ).toBe(
    "https://api.tscircuit.com/package_files/download?package_file_id=6e919e7d-1969-49c5-9092-4e2f9de592dc",
  )
})
