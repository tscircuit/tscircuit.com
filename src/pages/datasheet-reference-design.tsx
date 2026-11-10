import { PackageConfigurationPreview } from "@/components/PackageConfigurationPreview"
import { usePackagePreviewSelection } from "@/hooks/use-package-preview-selection"
import { updatePackagePreviewSelection } from "@/lib/package-preview-selection"

export default function DatasheetReferenceDesignPage({
  name,
}: { name: string }) {
  const selection = usePackagePreviewSelection()
  return (
    <PackageConfigurationPreview
      name={name}
      selection={selection}
      onSelectionChange={updatePackagePreviewSelection}
    />
  )
}
