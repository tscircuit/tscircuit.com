import { Package, PackageRelease } from "fake-snippets-api/lib/db/schema"

export const findPackageReleaseId = async (
  params:
    | string
    | {
        package_release_id: string
      }
    | {
        package_name: string
        use_latest_version: true
      }
    | {
        package_name_with_version: string
      }
    | {
        package_release_id?: string | undefined
        package_name_with_version?: string | undefined
      },
  ctx: { db: any },
): Promise<string | null> => {
  if (typeof params === "string") {
    return findPackageReleaseIdFromPackageNameWithVersion(params, ctx.db)
  }

  if (
    "package_name_with_version" in params &&
    params.package_name_with_version
  ) {
    const { package_name_with_version } = params

    if (package_name_with_version.endsWith("@latest")) {
      const [packageName] = package_name_with_version.split("@")
      return findPackageReleaseId(
        {
          package_name: packageName!,
          use_latest_version: true,
        },
        ctx,
      )
    }
    return findPackageReleaseIdFromPackageNameWithVersion(
      package_name_with_version!,
      ctx.db,
    )
  }

  if ("package_release_id" in params && params.package_release_id) {
    const packageRelease = ctx.db.packageReleases.find(
      (pr: PackageRelease) =>
        pr.package_release_id === params.package_release_id,
    )
    if (!packageRelease) {
      return null
    }
    return params.package_release_id
  }

  if ("package_name" in params) {
    const { package_name, use_latest_version } = params

    if (!use_latest_version) {
      throw new Error("use_latest_version must be true")
    }

    const pkg = ctx.db.packages.find(
      (p: Package) => p.name === package_name.replace(/^@/, ""),
    )
    if (!pkg) {
      return null
    }

    const packageRelease = ctx.db.packageReleases.find(
      (pr: PackageRelease) => pr.package_id === pkg.package_id && pr.is_latest,
    )

    if (!packageRelease) {
      return null
    }

    return packageRelease.package_release_id
  }

  return null
}

export const findPackageReleaseIdFromPackageNameWithVersion = (
  packageNameWithVersion: string,
  db: any,
): string | null => {
  if (!packageNameWithVersion) return null

  const [packageName, version] = packageNameWithVersion
    .replace(/^@/, "")
    .split("@")

  const pkg = db.packages.find((p: Package) => p.name === packageName)
  if (!pkg) {
    return null
  }

  let packageRelease

  if (!version || version === "latest") {
    packageRelease = db.packageReleases.find(
      (pr: PackageRelease) => pr.package_id === pkg.package_id && pr.is_latest,
    )
  } else {
    packageRelease = db.packageReleases.find(
      (pr: PackageRelease) =>
        pr.package_id === pkg.package_id && pr.version === version,
    )
  }

  if (!packageRelease) {
    return null
  }

  console.log("packageRelease", packageRelease)

  return packageRelease.package_release_id
}
