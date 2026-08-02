import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type {
  Package,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { isPackageReleaseInstallable } from "../utils/is-package-release-installable"

interface NoInstallableReleaseBannerProps {
  packageInfo?: Package
  packageRelease?: PublicPackageRelease
}

export default function NoInstallableReleaseBanner({
  packageInfo,
  packageRelease,
}: NoInstallableReleaseBannerProps) {
  if (!packageRelease) return null
  if (isPackageReleaseInstallable(packageRelease)) return null
  if (
    packageRelease.transpilation_in_progress ||
    packageRelease.circuit_json_build_in_progress
  ) {
    return null
  }

  const versionLabel = packageRelease.version
    ? `v${packageRelease.version}`
    : "This release"

  return (
    <Alert
      data-testid="no-installable-release-banner"
      className="mb-4 border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>This release has no installable build</AlertTitle>
      <AlertDescription>
        {versionLabel} was published without a build artifact, so{" "}
        <code className="font-mono">
          tsci add {packageInfo?.name ?? "this package"}
        </code>{" "}
        and package managers will fail with a "tag not found" error. Publishing
        a new release (for example with{" "}
        <code className="font-mono">tsci push</code>) will trigger a fresh
        build.
      </AlertDescription>
    </Alert>
  )
}
