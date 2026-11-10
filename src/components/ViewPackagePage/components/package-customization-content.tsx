import { PackageConfigurationPreview } from "@/components/PackageConfigurationPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackagePreviewParameters } from "@/hooks/use-package-preview-parameters"
import { usePackagePreviewSelection } from "@/hooks/use-package-preview-selection"
import { getPackagePreviewUrl } from "@/lib/package-file-routes"
import { updatePackagePreviewSelection } from "@/lib/package-preview-selection"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { Link } from "wouter"

export function PackageCustomizationContent() {
  const { packageInfo } = useCurrentPackageInfo()
  const { packageRelease } = useCurrentPackageRelease()
  const { isFetched, error: filesError } = usePackageFiles(
    packageRelease?.package_release_id,
  )
  const parameters = usePackagePreviewParameters()
  const selection = usePackagePreviewSelection()
  const resolvedSelection = {
    ...selection,
    release: packageRelease?.package_release_id,
  }
  const [author, packageName] = packageInfo?.name.split("/") ?? []
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6">
      <Card role="region" aria-labelledby="package-customize-heading">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle
            id="package-customize-heading"
            className="flex items-center gap-2 text-xl"
          >
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            Customize
          </CardTitle>
          {packageInfo && (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link
                href={getPackagePreviewUrl({
                  author,
                  packageName,
                  selection: resolvedSelection,
                })}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to package
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!packageInfo ||
          !packageRelease ||
          (!isFetched && !filesError) ||
          parameters.isLoading ? (
            <div
              className="flex h-[620px] items-center justify-center text-sm text-gray-500"
              role="status"
            >
              Loading configurations...
            </div>
          ) : filesError || parameters.error ? (
            <p role="alert">Unable to load configurations for this release.</p>
          ) : !parameters.manifest?.parameters.length ? (
            <p className="py-8 text-sm text-gray-500">
              This release has no published configuration fields.
            </p>
          ) : (
            <PackageConfigurationPreview
              name={packageInfo.name}
              selection={resolvedSelection}
              onSelectionChange={updatePackagePreviewSelection}
            />
          )}
        </CardContent>
      </Card>
    </main>
  )
}
