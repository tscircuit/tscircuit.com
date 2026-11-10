import { ContentLoadingErrorPage } from "@/components/ContentLoadingErrorPage"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import PackageHeader from "@/components/ViewPackagePage/components/package-header"
import { PackageConfigurationPreview } from "@/components/PackageConfigurationPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useGlobalStore } from "@/hooks/use-global-store"
import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackagePreviewParameters } from "@/hooks/use-package-preview-parameters"
import { usePackagePreviewSelection } from "@/hooks/use-package-preview-selection"
import { getPackagePreviewUrl } from "@/lib/package-file-routes"
import { updatePackagePreviewSelection } from "@/lib/package-preview-selection"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { Link } from "wouter"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"

export default function CustomizePackagePage() {
  const {
    packageInfo,
    packageSlug,
    error: packageError,
  } = useCurrentPackageInfo()
  const { packageRelease, error: releaseError } = useCurrentPackageRelease()
  const session = useGlobalStore((state) => state.session)
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
  const packageLoadError = packageError || releaseError
  if (packageLoadError?.status === 404)
    return <NotFoundPage heading="Package Not Found" />
  if (packageLoadError)
    return (
      <ContentLoadingErrorPage
        heading="Unable to load package"
        subtitle="The package configuration page could not be loaded."
        error={packageLoadError}
      />
    )
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-sans">
      <Helmet>
        <title>{`Customize - ${packageInfo?.name ?? packageSlug ?? "Package"} - tscircuit`}</title>
      </Helmet>
      <Header />
      <PackageHeader
        packageInfo={packageInfo}
        packageRelease={packageRelease}
        isPrivate={packageInfo?.is_private ?? false}
        isCurrentUserAuthor={Boolean(
          session && packageInfo?.creator_account_id === session.account_id,
        )}
      />
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
              <p role="alert">
                Unable to load configurations for this release.
              </p>
            ) : !parameters.manifest?.parameters.length ? (
              <p className="py-8 text-sm text-gray-500">
                This release has no published configuration fields.
              </p>
            ) : (
              <PackageConfigurationPreview
                hidePackageLink
                name={packageInfo.name}
                selection={resolvedSelection}
                onSelectionChange={updatePackagePreviewSelection}
              />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
