import { describe, expect, test } from "bun:test"
import { getPackagePageImageUrl } from "../server/package-page-seo.js"

const registryUrl = "https://api.tscircuit.com"
const baseOptions = {
  registryUrl,
  packageInfo: {
    default_view: "3d",
    latest_package_release_fs_sha: "md5-latest",
  },
  packageRelease: null,
  author: "alice",
  packageName: "board",
}

describe("getPackagePageImageUrl", () => {
  test("uses the release's built dist 3D preview", () => {
    const builtPreviewUrl =
      "https://api.tscircuit.com/package_files/view?package_release_id=release-1&file_path=dist%2Findex%2F3d.png"

    expect(
      getPackagePageImageUrl({
        ...baseOptions,
        packageRelease: { cad_preview_image_url: builtPreviewUrl },
      }),
    ).toBe(builtPreviewUrl)
  })

  test("falls back to the package's latest built 3D preview", () => {
    const builtPreviewPath =
      "/package_files/view?package_release_id=release-1&file_path=dist%2Findex%2F3d.png"

    expect(
      getPackagePageImageUrl({
        ...baseOptions,
        packageInfo: {
          ...baseOptions.packageInfo,
          latest_cad_preview_image_url: builtPreviewPath,
        },
      }),
    ).toBe(`${registryUrl}${builtPreviewPath}`)
  })

  test("uses the image renderer when no built 3D preview is available", () => {
    expect(getPackagePageImageUrl(baseOptions)).toBe(
      `${registryUrl}/packages/images/alice/board/3d.png?fs_sha=md5-latest`,
    )
  })

  test("preserves the configured non-3D thumbnail renderer", () => {
    expect(
      getPackagePageImageUrl({
        ...baseOptions,
        packageInfo: { ...baseOptions.packageInfo, default_view: "pcb" },
      }),
    ).toBe(
      `${registryUrl}/packages/images/alice/board/pcb.png?fs_sha=md5-latest`,
    )
  })
})
