import { Button } from "@/components/ui/button"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackagePreviewParameters } from "@/hooks/use-package-preview-parameters"
import { usePackagePreviewSelection } from "@/hooks/use-package-preview-selection"
import { getPackagePreviewUrl } from "@/lib/package-file-routes"
import { SlidersHorizontal } from "lucide-react"
import { useQueryClient } from "react-query"
import { Link } from "wouter"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"

export function PackageCustomizeButton() {
  const { packageInfo } = useCurrentPackageInfo()
  const { packageRelease } = useCurrentPackageRelease()
  const { manifest } = usePackagePreviewParameters()
  const { previewFilePath } = useCurrentPackageCircuitJson()
  const selection = usePackagePreviewSelection()
  const queryClient = useQueryClient()
  if (!packageInfo || !packageRelease || !manifest?.parameters.length)
    return null
  const [author, packageName] = packageInfo.name.split("/")
  return (
    <Button variant="outline" size="sm" className="mt-4 w-full gap-2" asChild>
      <Link
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
        onClick={() =>
          queryClient.setQueryData(
            [
              "packageRelease",
              { package_release_id: packageRelease.package_release_id },
            ],
            packageRelease,
          )
        }
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Customize
      </Link>
    </Button>
  )
}
