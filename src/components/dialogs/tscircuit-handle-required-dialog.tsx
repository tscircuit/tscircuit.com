import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { createUseDialog } from "./create-use-dialog"
import { AlertCircle } from "lucide-react"
import { useLocation } from "wouter"

export const TscircuitHandleRequiredDialog = ({
  open,
  onOpenChange,
  message = "Please set a tscircuit handle before using this feature. Visit account settings to add one.",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  message?: string
}) => {
  const [, navigate] = useLocation()

  const handleGoToSettings = () => {
    onOpenChange(false)
    navigate("/settings")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Tscircuit Handle Required
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              onClick={handleGoToSettings}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Go to Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useTscircuitHandleRequiredDialog = createUseDialog(
  TscircuitHandleRequiredDialog,
)
