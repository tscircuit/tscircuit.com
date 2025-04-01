import RepoPageContent from "@/components/ViewPackagePage/components/repo-page-content"
import SimulatePage from "@/components/ViewPackagePage/simulate-page"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageFiles } from "@/hooks/use-package-files"
import { usePackageRelease } from "@/hooks/use-package-release"
import { useLocation } from "wouter"

export const ViewPackagePage = () => {
  // Get the current path and extract author/packageName
  const [location] = useLocation()
  const pathParts = location.split("/")
  const author = pathParts[2]
  const urlPackageName = pathParts[3]
  const fullPackageName = `${author}/${urlPackageName}`

  const { data: packageInfo } = usePackageByName(fullPackageName)

  const { data: packageRelease } = usePackageRelease({
    is_latest: true,
    package_name: fullPackageName,
  })

  const { data: packageFiles } = usePackageFiles(
    packageRelease?.package_release_id,
  )

  return (
    <RepoPageContent
      packageFiles={packageFiles as any}
      packageInfo={packageInfo as any}
      importantFilePaths={["README.md", "LICENSE", "package.json"]}
      onFileClicked={() => {}}
      onDirectoryClicked={() => {}}
      onExportClicked={() => {}}
      onEditClicked={() => {}}
    />
  )
}
