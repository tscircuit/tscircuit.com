import { ReferenceDesignPreview } from "@/components/ReferenceDesignPreview"
import { useReferenceDesignSelection } from "@/hooks/use-reference-design-selection"
import { updateReferenceDesignSelection } from "@/lib/reference-design-selection"

export default function DatasheetReferenceDesignPage({
  name,
}: { name: string }) {
  const selection = useReferenceDesignSelection()
  return (
    <ReferenceDesignPreview
      name={name}
      selection={selection}
      onSelectionChange={updateReferenceDesignSelection}
    />
  )
}
