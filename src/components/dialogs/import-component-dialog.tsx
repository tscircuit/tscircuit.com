import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { createUseDialog } from "./create-use-dialog"
import {
  ImportComponentDialog2 as RunframeImportComponentDialog,
  type ImportComponentDialog2Props,
} from "@tscircuit/runframe/runner"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSignIn } from "@/hooks/use-sign-in"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { LogIn } from "lucide-react"

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
  const signIn = useSignIn()

  if (!session) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <LogIn className="h-5 w-5 text-blue-600" />
              Sign In Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Please sign in to import components.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={signIn} className="w-full sm:w-auto">
                Sign In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
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
