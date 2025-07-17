import {
  type ComponentSearchResult,
  ImportComponentDialog as RunframeImportComponentDialog,
} from "@tscircuit/runframe/runner"
import { createUseDialog } from "./create-use-dialog"

export const ImportComponentDialog = ({
  open,
  onOpenChange,
  onComponentSelected,
}: {
  open: boolean
  onOpenChange: (open: boolean) => any
  onComponentSelected: (pkg: ComponentSearchResult) => any
}) => {
  return (
    <RunframeImportComponentDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      onImport={(data) => onComponentSelected(data)}
    />
  )
}

export const useImportComponentDialog = createUseDialog(ImportComponentDialog)
