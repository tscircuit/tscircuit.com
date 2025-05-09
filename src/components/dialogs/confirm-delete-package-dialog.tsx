import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { createUseDialog } from "./create-use-dialog"
import { useDeletePackage } from "@/hooks/use-delete-package"

export const ConfirmDeletePackageDialog = ({
  open,
  onOpenChange,
  packageId,
  packageName,
  refetchUserPackages,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  packageName: string
  refetchUserPackages?: () => void
}) => {
  const { mutate: deletePackage, isLoading } = useDeletePackage({
    onSuccess: () => {
      onOpenChange(false)
      refetchUserPackages?.()
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete Package</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete the package "{packageName}"?</p>
        <p>This action cannot be undone.</p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deletePackage({ package_id: packageId })}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useConfirmDeletePackageDialog = createUseDialog(
  ConfirmDeletePackageDialog,
)
