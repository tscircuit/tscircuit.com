import RepoPageContent from "@/components/ViewPackagePage/components/repo-page-content"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackageRelease } from "@/hooks/use-package-release"
import { useLocation, useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import { useEffect, useState } from "react"
import NotFoundPage from "./404"
import { useGlobalStore } from "@/hooks/use-global-store"

export const ViewPackagePage = () => {
  const { packageInfo, loading: isLoadingPackageInfo } = useCurrentPackageInfo()
  const { author, packageName } = useParams()
  const [, setLocation] = useLocation()
  const [isNotFound, setIsNotFound] = useState(false)
  const session = useGlobalStore((s) => s.session)
  const {
    data: packageRelease,
    error: packageReleaseError,
    isLoading: isLoadingPackageRelease,
  } = usePackageRelease({
    is_latest: true,
    package_name: `${author}/${packageName}`,
  })

  const { data: packageFiles } = usePackageFiles(
    packageRelease?.package_release_id,
  )
  useEffect(() => {
    if (isLoadingPackageRelease) return
    if (packageReleaseError?.status == 404) {
      setIsNotFound(true)
    }
  }, [isLoadingPackageRelease, packageReleaseError])

  // Do  not allow to see private packages
  if (
    !isLoadingPackageInfo &&
    packageInfo?.is_private &&
    packageInfo?.owner_github_username !== session?.github_username
  ) {
    return <NotFoundPage heading="Package Not Found" />
  }

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
        onEditClicked={(file_path?: string) => {
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
