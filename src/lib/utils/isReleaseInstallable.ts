import type { PublicPackageRelease } from "fake-snippets-api/lib/db/schema"

/**
 * A package release is installable via `tsci add` / npm only once it has a
 * transpiled artifact. Releases whose build never completed (has_transpiled
 * is false, null, or undefined) still show up in search and on the package
 * page, but installing them fails with an undebuggable "tag not found, but
 * package exists" error. The package page should surface an explicit
 * "no installable release" state for these instead.
 * See https://github.com/tscircuit/tscircuit.com/issues/4204
 */
export function isReleaseInstallable(
  release?: Pick<PublicPackageRelease, "has_transpiled"> | null,
): boolean {
  return release?.has_transpiled === true
}
