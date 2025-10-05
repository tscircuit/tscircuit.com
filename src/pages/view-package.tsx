import RepoPageContent from "@/components/ViewPackagePage/components/repo-page-content"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useLocation, useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import { useEffect, useRef } from "react"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { Sentry } from "@/lib/sentry"

export const ViewPackagePage = () => {
  const { author, packageName } = useParams()
  const packageNameFull = `${author}/${packageName}`
  const [, setLocation] = useLocation()

  // Get package data directly by name - this will also cache by ID
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

  const packageNotFoundLoggedRef = useRef(false)
  const packageReleaseNotFoundLoggedRef = useRef(false)

  useEffect(() => {
    packageNotFoundLoggedRef.current = false
    packageReleaseNotFoundLoggedRef.current = false
  }, [packageNameFull])

  useEffect(() => {
    const status = (packageError as any)?.status
    if (
      !packageNotFoundLoggedRef.current &&
      !isLoadingPackage &&
      packageError &&
      status === 404
    ) {
      Sentry.captureMessage("package:view:not-found", {
        level: "warning",
        tags: {
          slug: packageNameFull,
        },
        extra: {
          status,
          message: packageError.message,
        },
      })
      packageNotFoundLoggedRef.current = true
    }
  }, [isLoadingPackage, packageError, packageNameFull])

  useEffect(() => {
    if (
      !packageReleaseNotFoundLoggedRef.current &&
      !isLoadingPackageRelease &&
      packageReleaseError?.status === 404
    ) {
      Sentry.captureMessage("package:view:release-not-found", {
        level: "warning",
        tags: {
          slug: packageNameFull,
        },
        extra: {
          status: packageReleaseError.status,
          message: packageReleaseError.message,
        },
      })
      packageReleaseNotFoundLoggedRef.current = true
    }
  }, [isLoadingPackageRelease, packageReleaseError, packageNameFull])

  if (!isLoadingPackage && packageError) {
    return <NotFoundPage heading="Package Not Found" />
  }

  if (!isLoadingPackageRelease && packageReleaseError?.status == 404) {
    return <NotFoundPage heading="Package Not Found" />
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
