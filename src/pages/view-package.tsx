import RepoPageContent from "@/components/ViewPackagePage/components/repo-page-content"
import { useCurrentPackageId } from "@/hooks/useCurrentPackageId"
import { usePackage } from "@/hooks/use-package"
import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackageRelease } from "@/hooks/use-package-release"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useLocation, useParams } from "wouter"
import NotFoundPage from "./404"

export const ViewPackagePage = () => {
  const {
    packageId,
    error: packageIdError,
    isLoading: isLoadingPackageId,
  } = useCurrentPackageId()
  const { data: packageInfo } = usePackage(packageId)
  const { author, packageName } = useParams()
  const [, setLocation] = useLocation()
  const {
    data: packageRelease,
    error: packageReleaseError,
    isLoading: isLoadingPackageRelease,
  } = usePackageRelease(
    {
      is_latest: true,
      package_name: `${author}/${packageName}`,
      include_ai_review: true,
    },
    {
      refetchInterval: (data) =>
        data?.ai_review_requested && !data.ai_review_text ? 2000 : false,
    },
  )

  const { data: packageFiles } = usePackageFiles(
    packageRelease?.package_release_id,
  )

  if (!isLoadingPackageId && packageIdError) {
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
        packageFiles={packageFiles as any}
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
