import RepoPageContent from "@/components/ViewPackagePage/components/repo-page-content"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useLocation, useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { SentryNotFoundReporter } from "@/components/SentryNotFoundReporter"
import { ContentLoadingErrorPage } from "@/components/ContentLoadingErrorPage"

export const ViewPackagePage = () => {
  const { author, packageName } = useParams()
  const packageNameFull = `${author}/${packageName}`
  const [, setLocation] = useLocation()

  const {
    data: packageInfo,
    error: packageError,
    isLoading: isLoadingPackage,
  } = usePackageByName(packageNameFull)
  const {
    packageRelease,
    error: packageReleaseError,
    isLoading: isLoadingPackageRelease,
  } = useCurrentPackageRelease({
    include_ai_review: true,
    refetchInterval: (data) =>
      data?.ai_review_requested && !data.ai_review_text ? 2000 : false,
  })

  const { data: packageFiles, isFetched: arePackageFilesFetched } =
    usePackageFiles(packageRelease?.package_release_id)

  if (!isLoadingPackage && packageError) {
    const status = (packageError as any)?.status
    if (status === 403) {
      return (
        <ContentLoadingErrorPage
          heading="Access Forbidden"
          subtitle="You don't have permission to view this package. Check your organization settings or contact the package owner."
          error={packageError}
        />
      )
    }
    if (status !== 404) {
      return (
        <ContentLoadingErrorPage
          heading="Error Loading Package"
          subtitle={`Failed to load package "${packageNameFull}".`}
          error={packageError}
        />
      )
    }
    return (
      <>
        <SentryNotFoundReporter
          context="package"
          slug={packageNameFull}
          status={status}
          message={packageError.message}
        />
        <NotFoundPage heading="Package Not Found" />
      </>
    )
  }

  if (!isLoadingPackageRelease && packageReleaseError) {
    const status = packageReleaseError.status
    if (status === 403) {
      return (
        <ContentLoadingErrorPage
          heading="Access Forbidden"
          subtitle="You don't have permission to view this package release. This may be due to misconfigured organization settings."
          error={packageReleaseError}
        />
      )
    }
    if (status !== 404) {
      return (
        <ContentLoadingErrorPage
          heading="Error Loading Package Release"
          subtitle={`Package "${packageNameFull}" exists but there was an error loading its release.`}
          error={packageReleaseError}
        />
      )
    }
    return (
      <>
        <SentryNotFoundReporter
          context="package_release"
          slug={packageNameFull}
          status={status}
          message={packageReleaseError.message}
        />
        <NotFoundPage
          heading="Package Release Not Found"
          subtitle={`Package "${packageNameFull}" exists but has no published releases. The package may not have been fully saved.`}
        />
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>{`${author}/${packageName} - tscircuit`}</title>
      </Helmet>
      <RepoPageContent
        packageFiles={packageFiles ?? []}
        arePackageFilesFetched={arePackageFilesFetched}
        packageInfo={packageInfo}
        packageRelease={packageRelease}
        importantFilePaths={["README.md", "LICENSE", "package.json"]}
        onFileClicked={(file) => {
          if (!packageInfo?.package_id) return
          setLocation(
            `/editor?package_id=${packageInfo?.package_id}&file_path=${file.file_path}`,
          )
        }}
        onEditClicked={(file_path?: string) => {
          if (!packageInfo?.package_id) return
          setLocation(
            `/editor?package_id=${packageInfo?.package_id}${
              file_path ? `&file_path=${file_path}` : ""
            }`,
          )
        }}
      />
    </>
  )
}
