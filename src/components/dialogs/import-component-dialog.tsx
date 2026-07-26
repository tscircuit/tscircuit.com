import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useToast } from "@/hooks/use-toast"
import {
  type ImportComponentDialog2Props,
  ImportComponentDialog2 as RunframeImportComponentDialog,
} from "@tscircuit/runframe/runner"
import { useEffect, useRef, useState } from "react"
import { createUseDialog } from "./create-use-dialog"

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
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const { toastLibrary } = useToast()
  const sessionCheckStartedRef = useRef(false)
  const [validatedSessionToken, setValidatedSessionToken] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!open) {
      sessionCheckStartedRef.current = false
      setValidatedSessionToken(null)
      return
    }

    if (!session?.token) {
      if (!sessionCheckStartedRef.current) {
        toastLibrary.error("Please sign in to import from JLCPCB")
      }
      onOpenChange(false)
      return
    }

    let cancelled = false
    sessionCheckStartedRef.current = true
    setValidatedSessionToken(null)

    axios
      .post("/sessions/list", {})
      .then(() => {
        if (!cancelled) {
          setValidatedSessionToken(session.token)
        }
      })
      .catch((error: any) => {
        if (cancelled) return

        const status = error?.response?.status ?? error?.status
        if (status !== 401) {
          toastLibrary.error(
            "We couldn't verify your session. Please try again.",
          )
        }
        onOpenChange(false)
      })

    return () => {
      cancelled = true
    }
  }, [axios, open, onOpenChange, session?.token, toastLibrary])

  if (!session || validatedSessionToken !== session.token) {
    return null
  }

  return (
    <RunframeImportComponentDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      jlcpcbProxyApiBase={apiBaseUrl}
      tscircuitSessionToken={session?.token}
      {...rest}
    />
  )
}

export const useImportComponentDialog = createUseDialog(ImportComponentDialog)
