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
  test("uses a white-background image pinned to the selected release", () => {
    expect(
      getPackagePageImageUrl({
        ...baseOptions,
        packageInfo: {
          ...baseOptions.packageInfo,
          latest_package_release_id: "latest-release",
          latest_cad_preview_image_url: "https://example.com/latest.png",
        },
        packageRelease: {
          package_release_id: "selected-release",
          cad_preview_image_url: "https://example.com/transparent.png",
        },
      }),
    ).toBe(
      `${registryUrl}/packages/images/alice/board/3d-whitebg.png?package_release_id=selected-release`,
    )
  })

  test("uses the latest release ID when no release was loaded", () => {
    expect(
      getPackagePageImageUrl({
        ...baseOptions,
        packageInfo: {
          ...baseOptions.packageInfo,
          latest_package_release_id: "latest-release",
          latest_cad_preview_image_url:
            "/package_files/view?file_path=dist%2F3d.png",
        },
      }),
    ).toBe(
      `${registryUrl}/packages/images/alice/board/3d-whitebg.png?package_release_id=latest-release`,
    )
  })

  test("falls back to the filesystem hash when no release ID is available", () => {
    expect(getPackagePageImageUrl(baseOptions)).toBe(
      `${registryUrl}/packages/images/alice/board/3d-whitebg.png?fs_sha=md5-latest`,
    )
  })

  test("defaults missing and unsupported views to a white-background 3D preview", () => {
    for (const default_view of [undefined, null, "code"]) {
      expect(
        getPackagePageImageUrl({
          ...baseOptions,
          packageInfo: { ...baseOptions.packageInfo, default_view },
        }),
      ).toBe(
        `${registryUrl}/packages/images/alice/board/3d-whitebg.png?fs_sha=md5-latest`,
      )
    }
  })

  test("encodes package names and release selectors", () => {
    expect(
      getPackagePageImageUrl({
        ...baseOptions,
        author: "alice org",
        packageName: "board/part",
        packageRelease: { package_release_id: "release&id" },
      }),
    ).toBe(
      `${registryUrl}/packages/images/alice%20org/board%2Fpart/3d-whitebg.png?package_release_id=release%26id`,
    )
  })

  test("preserves configured non-3D thumbnail renderers", () => {
    for (const default_view of ["pcb", "schematic", "assembly"]) {
      expect(
        getPackagePageImageUrl({
          ...baseOptions,
          packageInfo: { ...baseOptions.packageInfo, default_view },
        }),
      ).toBe(
        `${registryUrl}/packages/images/alice/board/${default_view}.png?fs_sha=md5-latest`,
      )
    }
  })
})
