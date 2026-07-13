import { describe, expect, test } from "bun:test"
import {
  decodePackageFilePath,
  getPackageDirectoryUrl,
  getPackageFileUrl,
} from "./package-file-routes"

describe("package file routes", () => {
  test("builds directory URLs while keeping path separators readable", () => {
    expect(
      getPackageDirectoryUrl({
        author: "test user",
        packageName: "my-board",
        directoryPath: "src/components",
      }),
    ).toBe("/test%20user/my-board/tree/src/components")
  })

  test("uses the package root URL for the root directory", () => {
    expect(
      getPackageDirectoryUrl({
        author: "testuser",
        packageName: "my-board",
        directoryPath: "",
      }),
    ).toBe("/testuser/my-board")
  })

  test("encodes and decodes special characters in file paths", () => {
    const url = getPackageFileUrl({
      author: "testuser",
      packageName: "my-board",
      filePath: "docs/USB C #1.md",
    })

    expect(url).toBe("/testuser/my-board/blob/docs/USB%20C%20%231.md")
    expect(decodePackageFilePath("docs/USB%20C%20%231.md")).toBe(
      "docs/USB C #1.md",
    )
  })
})
