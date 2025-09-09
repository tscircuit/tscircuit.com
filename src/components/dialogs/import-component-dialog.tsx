import { createUseDialog } from "./create-use-dialog"
import {
  ComponentSearchResult,
  ImportComponentDialog as RunframeImportComponentDialog,
} from "@tscircuit/runframe/runner"

export const ImportComponentDialog = ({
  open,
  onOpenChange,
  onComponentSelected,
  proxyRequestHeaders,
}: {
  open: boolean
  onOpenChange: (open: boolean) => any
  onComponentSelected: (pkg: ComponentSearchResult) => any
  proxyRequestHeaders?: any
}) => {
  return (
    <RunframeImportComponentDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      onImport={(data) => onComponentSelected(data)}
      proxyRequestHeaders={proxyRequestHeaders}
    />
  )
}

export const useImportComponentDialog = createUseDialog(ImportComponentDialog)
