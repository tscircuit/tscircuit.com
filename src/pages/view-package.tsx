import RepoPageContent from "@/components/ViewPackagePage/components/repo-page-content"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackageRelease } from "@/hooks/use-package-release"
import { useLocation, useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import { useEffect, useState } from "react"
import NotFoundPage from "./404"

export const ViewPackagePage = () => {
  const {
    packageInfo,
    isLoading: isLoadingPackageInfo,
    error: packageInfoError,
  } = useCurrentPackageInfo()
  const { author, packageName } = useParams()
  const [, setLocation] = useLocation()
  const [isNotFound, setIsNotFound] = useState(false)

  const {
    data: packageRelease,
    isLoading: isLoadingPackageRelease,
    error: packageReleaseError,
  } = usePackageRelease({
    is_latest: true,
    package_name: `${author}/${packageName}`,
  })

  const { data: packageFiles } = usePackageFiles(
    packageRelease?.package_release_id,
  )
  useEffect(() => {
    // Early return if still loading
    if (isLoadingPackageInfo || isLoadingPackageRelease) return

    // Check for 404 errors
    if (
      packageInfoError?.status === 404 ||
      packageReleaseError?.status === 404
    ) {
      setIsNotFound(true)
      return
    }

    // Check if package info is missing
    if (!packageInfo) {
      setIsNotFound(true)
      return
    }

    // Check if package release is missing
    if (!packageRelease) {
      setIsNotFound(true)
      return
    }
  }, [
    packageInfo,
    packageRelease,
    isLoadingPackageInfo,
    isLoadingPackageRelease,
    packageInfoError,
    packageReleaseError,
  ])

  if (isNotFound) {
    return <NotFoundPage heading="Package Not Found" />
  }

  return (
    <>
      <Helmet>
        <title>{`${author}/${packageName} - tscircuit`}</title>
      </Helmet>
      <RepoPageContent
        packageFiles={packageFiles as any}
        packageInfo={packageInfo as any}
        importantFilePaths={["README.md", "LICENSE", "package.json"]}
        onFileClicked={(file) => {
          setLocation(
            `/editor?package_id=${packageInfo?.package_id}&file_path=${file.file_path}`,
          )
        }}
        onEditClicked={() => {
          setLocation(`/editor?package_id=${packageInfo?.package_id}`)
        }}
      />
    </>
  )
}
