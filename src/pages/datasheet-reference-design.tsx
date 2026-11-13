import { PackagePreviewProvider } from "@/components/PackagePreviewScope"
import { usePackageConfiguration } from "@/hooks/use-package-configuration"
import { PackageConfigurationPreview } from "@/components/PackageConfigurationPreview"
import { usePackagePreviewSelection } from "@/hooks/use-package-preview-selection"
import { updatePackagePreviewSelection } from "@/lib/package-preview-selection"

export default function DatasheetReferenceDesignPage({
  name,
  releaseId,
}: { name: string; releaseId: string }) {
  const selection = usePackagePreviewSelection()
  const configuration = usePackageConfiguration({
    name,
    selection: { ...selection, release: selection.release || releaseId },
  })
  return (
    <PackagePreviewProvider value={configuration.scope}>
      <PackageConfigurationPreview
        configuration={configuration}
        onSelectionChange={updatePackagePreviewSelection}
      />
    </PackagePreviewProvider>
  )
}
