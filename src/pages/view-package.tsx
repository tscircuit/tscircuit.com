import RepoPageContent from "@/components/ViewPackagePage/components/repo-page-content"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useLocation, useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import { useEffect, useState } from "react"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"

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
