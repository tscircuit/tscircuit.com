import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackagePreviewParameters } from "@/hooks/use-package-preview-parameters"
import { usePackagePreviewSelection } from "@/hooks/use-package-preview-selection"
import { getPackagePreviewUrl } from "@/lib/package-file-routes"
import { SlidersHorizontal } from "lucide-react"
import { Link } from "wouter"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"

export function PackageCustomizeLink() {
  const { packageInfo } = useCurrentPackageInfo()
  const { packageRelease } = useCurrentPackageRelease()
  const { manifest } = usePackagePreviewParameters()
  const { previewFilePath } = useCurrentPackageCircuitJson()
  const selection = usePackagePreviewSelection()
  if (!packageInfo || !packageRelease || !manifest?.parameters.length)
    return null
  const [author, packageName] = packageInfo.name.split("/")
  return (
    <Link
      className="flex items-center text-sm hover:underline hover:underline-offset-2 cursor-pointer hover:decoration-gray-500"
      href={getPackagePreviewUrl({
        author,
        packageName,
        selection: {
          ...selection,
          release: packageRelease.package_release_id,
          file: previewFilePath,
        },
        customize: true,
      })}
    >
      <SlidersHorizontal
        className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]"
        aria-hidden="true"
      />
      Customize
    </Link>
  )
}
