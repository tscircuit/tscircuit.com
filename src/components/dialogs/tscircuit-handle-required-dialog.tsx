import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { createUseDialog } from "./create-use-dialog"
import { UserCircle } from "lucide-react"
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
      <DialogContent className="w-[90vw] max-w-md rounded-lg border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-blue-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <UserCircle className="h-5 w-5 text-blue-600" />
            </div>
            <span>Handle Required</span>
          </DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 leading-relaxed pt-2">{message}</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            onClick={handleGoToSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm order-first sm:order-last"
          >
            Go to Settings
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 shadow-sm"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useTscircuitHandleRequiredDialog = createUseDialog(
  TscircuitHandleRequiredDialog,
)
