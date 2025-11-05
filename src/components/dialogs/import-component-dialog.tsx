import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
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
  const apiBaseUrl = useApiBaseUrl()

  return (
    <RunframeImportComponentDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      jlcpcbProxyApiBase={apiBaseUrl}
      {...rest}
    />
  )
}

export const useImportComponentDialog = createUseDialog(ImportComponentDialog)
