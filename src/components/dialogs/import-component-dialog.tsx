import { useEffect, useRef } from "react"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { createUseDialog } from "./create-use-dialog"
import {
  ImportComponentDialog2 as RunframeImportComponentDialog,
  type ImportComponentDialog2Props,
} from "@tscircuit/runframe/runner"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useToast } from "@/hooks/use-toast"

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
  const session = useGlobalStore((s) => s.session)
  const apiBaseUrl = useApiBaseUrl()
  const { toastLibrary } = useToast()
  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (open && !prevOpenRef.current && !session) {
      toastLibrary.error("Please sign in to import components")
      onOpenChange(false)
    }
    prevOpenRef.current = open
  }, [open, session, onOpenChange])

  if (!session) {
    return null
  }

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
