import { expect, test } from "bun:test"
import { isPackageReleaseInstallable } from "../src/components/ViewPackagePage/utils/is-package-release-installable"

test("isPackageReleaseInstallable matches the registry npm proxy behavior", () => {
  // Neither transpiled output nor a package build — the npm proxy advertises
  // a "latest" dist-tag but an empty versions map, so installs fail with
  // "tag not found" (issue #4204, e.g. @tsci/x4132.sht40_ad1b_r2)
  expect(
    isPackageReleaseInstallable({
      has_transpiled: false,
      latest_package_build_id: null,
    }),
  ).toBe(false)

  // Legacy release with transpiled output but no package build
  // (e.g. @tsci/abse2001.sparkfun-line-sensor-breakout-qre1113-analog)
  expect(
    isPackageReleaseInstallable({
      has_transpiled: true,
      latest_package_build_id: null,
    }),
  ).toBe(true)

  // Release served from a package build without legacy transpiled output
  // (e.g. @tsci/seveibar.red-led)
  expect(
    isPackageReleaseInstallable({
      has_transpiled: false,
      latest_package_build_id: "c37274a7-29e2-4c9e-8879-052abc70491d",
    }),
  ).toBe(true)

  // has_transpiled can come back null from the registry
  expect(
    isPackageReleaseInstallable({
      has_transpiled: null,
      latest_package_build_id: null,
    }),
  ).toBe(false)
})
