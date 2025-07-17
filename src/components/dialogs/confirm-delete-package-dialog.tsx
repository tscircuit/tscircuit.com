import { useDeletePackage } from "@/hooks/use-delete-package"
import { useQueryClient } from "react-query"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { createUseDialog } from "./create-use-dialog"

export const ConfirmDeletePackageDialog = ({
  open,
  onOpenChange,
  packageId,
  packageName,
  packageOwner,
  refetchUserPackages,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  packageName: string
  packageOwner: string
  refetchUserPackages?: () => void
}) => {
  const queryClient = useQueryClient()

  const { mutate: deletePackage, isLoading } = useDeletePackage({
    onSuccess: () => {
      onOpenChange(false)
      refetchUserPackages?.()
      queryClient.invalidateQueries({
        queryKey: ["userPackages", packageOwner],
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] p-6 rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-left">
            Confirm Delete Package
          </DialogTitle>
          <DialogDescription className="text-left">
            Are you sure you want to delete the package{" "}
            <span className="font-bold">{packageName}</span>?
          </DialogDescription>
        </DialogHeader>
        <p className="text-red-600 font-medium">
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4 mt-6">
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
