import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { createUseDialog } from "./create-use-dialog"
import { useDeleteAccountMutation } from "@/hooks/use-delete-account-mutation"
import { useState, useEffect } from "react"

interface ConfirmDeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tscircuitHandle?: string
  accountId?: string
}

export const ConfirmDeleteAccountDialog = ({
  open,
  onOpenChange,
  tscircuitHandle = "",
  accountId = "",
}: ConfirmDeleteAccountDialogProps) => {
  const [confirmText, setConfirmText] = useState("")
  const { mutate: deleteAccount, isLoading } = useDeleteAccountMutation({
    onSuccess: () => {
      onOpenChange(false)
      window.location.href = "/"
    },
  })

  useEffect(() => {
    if (!open) {
      setConfirmText("")
    }
  }, [open])

  const hasHandle = Boolean(tscircuitHandle)
  const confirmationMatchString = hasHandle ? `@${tscircuitHandle}` : accountId

  const confirmationPromptText = hasHandle ? (
    <>
      Please type{" "}
      <span className="font-bold select-all">{confirmationMatchString}</span> to
      confirm.
    </>
  ) : (
    <>
      Your tscircuit handle is not set. Please type your Account ID{" "}
      <span className="font-bold select-all">{confirmationMatchString}</span> to
      confirm.
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] p-6 rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-left text-red-600">
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-left space-y-2">
            <div>Are you sure you want to delete your account?</div>
            <div className="text-red-600 font-medium">
              This action cannot be undone. All your packages and data will be
              permanently removed.
            </div>
            <div className="pt-2">{confirmationPromptText}</div>
          </DialogDescription>
        </DialogHeader>

        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={
            hasHandle
              ? `Type ${confirmationMatchString} to confirm`
              : "Type account ID to confirm"
          }
          className="mt-2"
        />

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteAccount()}
            disabled={isLoading || confirmText !== confirmationMatchString}
          >
            {isLoading ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useConfirmDeleteAccountDialog = createUseDialog(
  ConfirmDeleteAccountDialog,
)
