import { ContentLoadingErrorPage } from "@/components/ContentLoadingErrorPage"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import PackageHeader from "@/components/ViewPackagePage/components/package-header"
import { PackageConfigurationPreview } from "@/components/PackageConfigurationPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGlobalStore } from "@/hooks/use-global-store"
import { usePackagePreviewSelection } from "@/hooks/use-package-preview-selection"
import { getPackagePreviewUrl } from "@/lib/package-file-routes"
import { updatePackagePreviewSelection } from "@/lib/package-preview-selection"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { Link, useParams } from "wouter"
import { usePackageConfiguration } from "@/hooks/use-package-configuration"
import { PackagePreviewProvider } from "@/components/PackagePreviewScope"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"

export default function CustomizePackagePage() {
  const { author = "", packageName = "" } = useParams()
  const name = `${author}/${packageName}`
  const selection = usePackagePreviewSelection()
  const configuration = usePackageConfiguration({ name, selection })
  const {
    packageInfo,
    packageRelease,
    packageError: packageLoadError,
  } = configuration
  const session = useGlobalStore((state) => state.session)
  const resolvedSelection = { ...selection, release: configuration.releaseId }
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
    <PackagePreviewProvider value={configuration.scope}>
      <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-sans">
        <Helmet>
          <title>{`Customize - ${packageInfo?.name ?? name} - tscircuit`}</title>
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
            </CardHeader>
            <CardContent>
              <PackageConfigurationPreview
                hidePackageLink
                configuration={configuration}
                onSelectionChange={updatePackagePreviewSelection}
              />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </PackagePreviewProvider>
  )
}
