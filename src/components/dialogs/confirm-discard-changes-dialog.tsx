import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { createUseDialog } from "./create-use-dialog"
import { useState } from "react"

export const ConfirmDiscardChangesDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) => {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleDiscard = () => {
    onConfirm()
    onOpenChange(false)
    setIsConfirming(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setIsConfirming(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) setIsConfirming(false)
      }}
    >
      <DialogContent className="w-[90vw]">
        <DialogHeader>
          <DialogTitle>Discard Changes</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to discard all unsaved changes?</p>
        <p className="text-red-600 font-medium">
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {!isConfirming ? (
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setIsConfirming(true)}
            >
              Discard Changes
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleDiscard}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Discard All Changes
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useConfirmDiscardChangesDialog = createUseDialog(
  ConfirmDiscardChangesDialog,
)
