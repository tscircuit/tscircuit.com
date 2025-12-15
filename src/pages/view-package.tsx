import RepoPageContent from "@/components/ViewPackagePage/components/repo-page-content"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useLocation, useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { SentryNotFoundReporter } from "@/components/SentryNotFoundReporter"
import { ContentLoadingErrorPage } from "@/components/ContentLoadingErrorPage"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { useEffect, useMemo, useCallback } from "react"
import { useUrlParams } from "@/hooks/use-url-params"

export const ViewPackagePage = () => {
  const { author, packageName } = useParams()
  const packageNameFull = `${author}/${packageName}`
  const [, setLocation] = useLocation()
  const urlParams = useUrlParams()
  const versionFromUrl = urlParams.version

  const {
    data: packageInfo,
    error: packageError,
    isLoading: isLoadingPackage,
  } = usePackageByName(packageNameFull)

  const { data: allReleases, isLoading: isLoadingReleases } =
    usePackageReleasesByPackageId(packageInfo?.package_id ?? null)

  const latestVersion = useMemo(() => {
    if (!allReleases || allReleases.length === 0) return null
    const sorted = [...allReleases].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    return sorted[0].version
  }, [allReleases])

  const isVersionValid = useMemo(() => {
    if (!versionFromUrl) return true
    if (!allReleases || allReleases.length === 0) return true
    return allReleases.some((r) => r.version === versionFromUrl)
  }, [versionFromUrl, allReleases])

  useEffect(() => {
    if (
      !isLoadingReleases &&
      allReleases &&
      allReleases.length > 0 &&
      versionFromUrl &&
      !isVersionValid
    ) {
      const params = new URLSearchParams(window.location.search)
      params.delete("version")
      const newSearch = params.toString()
      const newUrl =
        window.location.pathname +
        (newSearch ? `?${newSearch}` : "") +
        window.location.hash
      window.history.replaceState({}, "", newUrl)
      window.dispatchEvent(new Event("popstate"))
    }
  }, [isLoadingReleases, allReleases, versionFromUrl, isVersionValid])

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

  const handleVersionChange = useCallback(
    (version: string, _releaseId: string) => {
      const params = new URLSearchParams(window.location.search)
      if (version === latestVersion) {
        params.delete("version")
      } else {
        params.set("version", version)
      }
      const newSearch = params.toString()
      const newUrl =
        window.location.pathname +
        (newSearch ? `?${newSearch}` : "") +
        window.location.hash
      window.history.pushState({}, "", newUrl)
      window.dispatchEvent(new Event("popstate"))
    },
    [latestVersion],
  )

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
        currentVersion={versionFromUrl || packageRelease?.version || null}
        latestVersion={latestVersion || undefined}
        onVersionChange={handleVersionChange}
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
