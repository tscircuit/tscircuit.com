import { createUseDialog } from "./create-use-dialog"
import {
  ImportComponentDialog2 as RunframeImportComponentDialog,
  type ImportComponentDialog2Props,
} from "@tscircuit/runframe/runner"

export type ImportComponentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & Pick<
  ImportComponentDialog2Props,
  | "onTscircuitPackageSelected"
  | "onJlcpcbComponentTsxLoaded"
  | "onKicadStringSelected"
  | "jlcpcbProxyRequestHeaders"
  | "jlcpcbProxyApiBase"
>

export const ImportComponentDialog = ({
  open,
  onOpenChange,
  ...rest
}: ImportComponentDialogProps) => {
  return (
    <RunframeImportComponentDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      {...rest}
    />
  )
}

export const useImportComponentDialog = createUseDialog(ImportComponentDialog)
