import { describe, expect, it } from "bun:test"
import { getPackageDomainTargetInfo } from "./package-domain-target"
import type {
  PackageBuild,
  PublicPackageDomain,
} from "fake-snippets-api/lib/db/schema"

const baseDomain: PublicPackageDomain = {
  package_domain_id: "domain-1",
  points_to: "package",
  package_release_id: null,
  package_build_id: null,
  package_id: "pkg-1",
  tag: null,
  default_main_component_path: null,
  fully_qualified_domain_name: "pkg.tscircuit.app",
  created_at: new Date().toISOString(),
}

describe("getPackageDomainTargetInfo", () => {
  it("uses the specific tag as badge label for package_release_with_tag", () => {
    const info = getPackageDomainTargetInfo({
      ...baseDomain,
      points_to: "package_release_with_tag",
      tag: "latest",
    })

    expect(info.badgeLabel).toBe("Latest")
    expect(info.description).toBe('Points to releases tagged "latest".')
  })

  it("uses release version in description for package_release", () => {
    const info = getPackageDomainTargetInfo(
      {
        ...baseDomain,
        points_to: "package_release",
        package_release_id: "release-abc",
      },
      {
        releaseVersionById: {
          "release-abc": "1.2.3",
        },
      },
    )

    expect(info.description).toBe("Points to release v1.2.3.")
  })

  it("includes associated release version for package_build", () => {
    const build: PackageBuild = {
      package_build_id: "12345678-1234-4123-8123-123456789abc",
      package_release_id: "release-xyz",
      created_at: new Date().toISOString(),
      transpilation_in_progress: false,
      transpilation_logs: null,
      circuit_json_build_in_progress: false,
      circuit_json_build_logs: null,
      image_generation_in_progress: false,
      image_generation_logs: null,
      build_in_progress: false,
      build_error_last_updated_at: new Date().toISOString(),
    }

    const info = getPackageDomainTargetInfo(
      {
        ...baseDomain,
        points_to: "package_build",
        package_build_id: build.package_build_id,
      },
      {
        buildById: {
          [build.package_build_id]: build,
        },
        releaseVersionById: {
          "release-xyz": "2.0.0",
        },
      },
    )

    expect(info.description).toBe(
      "Points to build 123456…9abc from release v2.0.0.",
    )
  })
})
