import { normalizeProjectFilePath } from "fake-snippets-api/utils/normalizeProjectFilePath"
import { NotFoundError } from "winterspec/middleware"
import * as ZT from "../db/schema"
export const getPackageFileIdFromFileDescriptor = async (
  descriptor:
    | { package_file_id: string }
    | { package_release_id: string; file_path: string }
    | { package_id: string; version?: string; file_path: string }
    | { package_name: string; version?: string; file_path: string }
    | { package_name_with_version: string; file_path: string },
  ctx: { db: any },
): Promise<string> => {
  if ("package_file_id" in descriptor) {
    const packageFile = ctx.db.packageFiles.find(
      (pf: ZT.PackageFile) => pf.package_file_id === descriptor.package_file_id,
    )

    if (!packageFile) {
      throw new NotFoundError("Package file not found")
    }

    return descriptor.package_file_id
  }

  if ("package_release_id" in descriptor) {
    const { package_release_id, file_path } = descriptor
    const packageFile = ctx.db.packageFiles.find(
      (pf: ZT.PackageFile) =>
        pf.package_release_id === package_release_id &&
        normalizeProjectFilePath(pf.file_path) ===
          normalizeProjectFilePath(file_path),
    )

    if (!packageFile) {
      throw new NotFoundError("Package file not found")
    }

    return packageFile.package_file_id
  }

  if ("package_id" in descriptor) {
    const { package_id, version, file_path } = descriptor

    // Verify package exists
    const pkg = ctx.db.packages.find(
      (p: ZT.Package) => p.package_id === package_id,
    )
    if (!pkg) {
      throw new NotFoundError("Package not found")
    }

    // Find the package release
    let packageRelease
    if (version) {
      packageRelease = ctx.db.packageReleases.find(
        (pr: ZT.PackageRelease) =>
          pr.package_id === package_id && pr.version === version,
      )
    } else {
      packageRelease = ctx.db.packageReleases.find(
        (pr: ZT.PackageRelease) => pr.package_id === package_id && pr.is_latest,
      )
    }

    if (!packageRelease) {
      throw new NotFoundError("Package release not found")
    }

    // Find the file
    const packageFile = ctx.db.packageFiles.find(
      (pf: ZT.PackageFile) =>
        pf.package_release_id === packageRelease.package_release_id &&
        normalizeProjectFilePath(pf.file_path) ===
          normalizeProjectFilePath(file_path),
    )

    if (!packageFile) {
      throw new NotFoundError("Package file not found")
    }

    return packageFile.package_file_id
  }

  if ("package_name" in descriptor) {
    const { package_name, version, file_path } = descriptor

    // Find the package first
    const pkg = ctx.db.packages.find((p: ZT.Package) => p.name === package_name)
    if (!pkg) {
      throw new NotFoundError(`Package not found: ${package_name}`)
    }

    // Find the package release
    let packageRelease
    if (version) {
      packageRelease = ctx.db.packageReleases.find(
        (pr: ZT.PackageRelease) =>
          pr.package_id === pkg.package_id && pr.version === version,
      )
    } else {
      packageRelease = ctx.db.packageReleases.find(
        (pr: ZT.PackageRelease) =>
          pr.package_id === pkg.package_id && pr.is_latest,
      )
    }

    if (!packageRelease) {
      throw new NotFoundError("Package release not found")
    }

    // Find the file
    const packageFile = ctx.db.packageFiles.find(
      (pf: ZT.PackageFile) =>
        pf.package_release_id === packageRelease.package_release_id &&
        normalizeProjectFilePath(pf.file_path) ===
          normalizeProjectFilePath(file_path),
    )

    if (!packageFile) {
      throw new NotFoundError("Package file not found")
    }

    return packageFile.package_file_id
  }

  if ("package_name_with_version" in descriptor) {
    const { package_name_with_version, file_path } = descriptor
    const packageName = package_name_with_version.split("@")[1]
    const version = package_name_with_version.split("@")[2]

    // Find the package
    const pkg = ctx.db.packages.find((p: ZT.Package) => p.name === packageName)
    if (!pkg) {
      throw new NotFoundError(`Package not found: ${packageName}`)
    }

    // Find the package release
    let packageRelease
    if (!version || version === "latest") {
      packageRelease = ctx.db.packageReleases.find(
        (pr: ZT.PackageRelease) =>
          pr.package_id === pkg.package_id && pr.is_latest,
      )
    } else {
      packageRelease = ctx.db.packageReleases.find(
        (pr: ZT.PackageRelease) =>
          pr.package_id === pkg.package_id && pr.version === version,
      )
    }

    if (!packageRelease) {
      throw new NotFoundError(
        `Package release not found for version: ${version || "latest"}`,
      )
    }

    // Find the file
    const packageFile = ctx.db.packageFiles.find(
      (pf: ZT.PackageFile) =>
        pf.package_release_id === packageRelease.package_release_id &&
        normalizeProjectFilePath(pf.file_path) ===
          normalizeProjectFilePath(file_path),
    )

    if (!packageFile) {
      throw new NotFoundError(`Package file not found: ${file_path}`)
    }

    return packageFile.package_file_id
  }

  throw new NotFoundError("Invalid package file descriptor")
}
