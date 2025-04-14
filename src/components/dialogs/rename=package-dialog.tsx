import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { createUseDialog } from "./create-use-dialog"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"

export const RenamePackageDialog = ({
  open,
  onOpenChange,
  packageId,
  currentName,
  onRename,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  currentName: string
  onRename?: (newName: string) => void
}) => {
  const [newName, setNewName] = useState(currentName)
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  const renamePackageMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/packages/update", {
        package_id: packageId,
        name: newName,
      })
      if (response.status !== 200) {
        throw new Error("Failed to rename snippet")
      }
      return response.data
    },
    onSuccess: () => {
      onRename?.(newName)
      onOpenChange(false)
      toast({
        title: "Package renamed",
        description: `Successfully renamed to "${newName}"`,
      })
      qc.invalidateQueries({ queryKey: ["packages", packageId] })
    },
    onError: (error) => {
      console.error("Error renaming package:", error)
      toast({
        title: "Error",
        description: "Failed to rename the package. Please try again.",
        variant: "destructive",
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Package</DialogTitle>
        </DialogHeader>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value.replace(" ", "").trim())}
          placeholder="Enter new name"
          disabled={renamePackageMutation.isLoading}
        />
        <Button
          disabled={renamePackageMutation.isLoading}
          onClick={() => renamePackageMutation.mutate()}
        >
          {renamePackageMutation.isLoading ? "Renaming..." : "Rename"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export const useRenamePackageDialog = createUseDialog(RenamePackageDialog)
