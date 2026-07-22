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
import {
  decodePackageFilePath,
  getPackageDirectoryUrl,
  getPackageFileUrl,
  getPackageRootUrl,
} from "@/lib/package-file-routes"

export const ViewPackagePage = ({
  fileBrowserMode,
}: {
  fileBrowserMode?: "directory" | "file"
}) => {
  const {
    author = "",
    packageName = "",
    "*": routePath,
  } = useParams<{
    author: string
    packageName: string
    "*"?: string
  }>()
  const packageNameFull = `${author}/${packageName}`
  const [, setLocation] = useLocation()
  const urlParams = useUrlParams()
  const versionFromUrl = urlParams.version
  const fileBrowserPath = decodePackageFilePath(routePath)

  const {
    data: packageInfo,
    error: packageError,
    isLoading: isLoadingPackage,
  } = usePackageByName(packageNameFull)

  const { data: allReleases, isLoading: isLoadingReleases } =
    usePackageReleasesByPackageId(packageInfo?.package_id ?? null)

  const latestVersion = useMemo(() => {
    if (!allReleases || allReleases.length === 0) return undefined
    const latestRelease = allReleases.find((r) => r.is_latest)
    if (latestRelease?.version) return latestRelease.version
    if (
      packageInfo?.latest_version &&
      allReleases.some((r) => r.version === packageInfo?.latest_version)
    ) {
      return packageInfo?.latest_version
    }
  }, [allReleases, packageInfo?.latest_version])

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
  } = useCurrentPackageRelease()

  const {
    data: packageFiles,
    isFetched: arePackageFilesFetched,
    error: packageFilesError,
  } = usePackageFiles(packageRelease?.package_release_id)

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
  const currentVersion = versionFromUrl || latestVersion || null
  const versionSearch =
    versionFromUrl && versionFromUrl !== latestVersion
      ? `?${new URLSearchParams({ version: versionFromUrl }).toString()}`
      : ""
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
        <title>
          {fileBrowserMode === "file" && fileBrowserPath
            ? `${fileBrowserPath} - ${author}/${packageName} - tscircuit`
            : `${author}/${packageName} - tscircuit`}
        </title>
      </Helmet>
      <RepoPageContent
        packageFiles={packageFiles ?? []}
        arePackageFilesFetched={arePackageFilesFetched}
        packageFilesError={packageFilesError}
        packageInfo={packageInfo}
        packageRelease={packageRelease}
        importantFilePaths={["README.md", "LICENSE", "package.json"]}
        currentVersion={currentVersion}
        latestVersion={latestVersion}
        onVersionChange={handleVersionChange}
        fileBrowserMode={fileBrowserMode}
        fileBrowserPath={fileBrowserPath}
        onDirectoryClicked={(directoryPath) => {
          const directoryUrl = getPackageDirectoryUrl({
            author,
            packageName,
            directoryPath,
          })
          setLocation(
            `${directoryUrl}${versionSearch}${directoryPath ? "" : "#files"}`,
          )
        }}
        onFileBrowserViewChange={(view) => {
          setLocation(
            `${getPackageRootUrl(author, packageName)}${versionSearch}#${view}`,
          )
        }}
        onFileClicked={(file) => {
          setLocation(
            `${getPackageFileUrl({
              author,
              packageName,
              filePath: file.file_path,
            })}${versionSearch}`,
          )
        }}
        onEditClicked={(file_path?: string | null) => {
          if (!packageInfo?.package_id) return
          const params = new URLSearchParams({
            package_id: packageInfo.package_id,
          })
          if (file_path) params.set("file_path", file_path)
          if (versionFromUrl && versionFromUrl !== latestVersion) {
            params.set("version", versionFromUrl)
          }
          setLocation(`/editor?${params.toString()}`)
        }}
      />
    </>
  )
}
