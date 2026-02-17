import type {
  PackageBuild,
  PublicPackageDomain,
} from "fake-snippets-api/lib/db/schema"

type PackageDomainTargetContext = {
  releaseVersionById?: Record<string, string | null | undefined>
  buildById?: Record<string, PackageBuild | undefined>
}

function shortId(value?: string | null): string | null {
  if (!value) return null
  return value.length > 10 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value
}

function formatVersion(version?: string | null): string | null {
  if (!version) return null
  return version.startsWith("v") ? version : `v${version}`
}

export function getPackageDomainTargetInfo(
  domain: PublicPackageDomain,
  context: PackageDomainTargetContext = {},
): {
  badgeLabel: string
  description: string
} {
  switch (domain.points_to) {
    case "package":
      return {
        badgeLabel: "Latest",
        description: "Points to the package's latest release.",
      }

    case "package_release_with_tag":
      return {
        badgeLabel: "Tag",
        description: domain.tag
          ? `Points to releases tagged "${domain.tag}".`
          : "Points to releases selected by tag.",
      }

    case "package_release": {
      const releaseId = domain.package_release_id
      const formattedVersion = formatVersion(
        releaseId ? context.releaseVersionById?.[releaseId] : null,
      )

      return {
        badgeLabel: "Release",
        description: formattedVersion
          ? `Points to release ${formattedVersion}.`
          : shortId(releaseId)
            ? `Points to release ${shortId(releaseId)}.`
            : "Points to a specific release.",
      }
    }

    case "package_build": {
      const buildId = domain.package_build_id
      const build = buildId ? context.buildById?.[buildId] : null
      const releaseVersion = formatVersion(
        build?.package_release_id
          ? context.releaseVersionById?.[build.package_release_id]
          : null,
      )

      return {
        badgeLabel: "Build",
        description: shortId(buildId)
          ? releaseVersion
            ? `Points to build ${shortId(buildId)} from release ${releaseVersion}.`
            : "Points to a specific build and its release."
          : "Points to a specific build.",
      }
    }

    default:
      return {
        badgeLabel: "Unknown",
        description: "Target is not available.",
      }
  }
}
