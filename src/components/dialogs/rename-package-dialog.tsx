import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import type { Package } from "fake-snippets-api/lib/db/schema"
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
    mutationFn: async (): Promise<Package> => {
      const response = await axios.post("/packages/update", {
        package_id: packageId,
        name: newName,
      })
      if (response.status !== 200) {
        throw new Error("Failed to rename package")
      }
      const updatedPackage = response.data?.package as Package | undefined
      if (!updatedPackage) {
        throw new Error("Failed to rename package")
      }
      return updatedPackage
    },
    onSuccess: (updatedPackage) => {
      const updatedName = updatedPackage?.unscoped_name ?? newName
      onRename?.(updatedName)
      setNewName(updatedName)
      onOpenChange(false)
      toast({
        title: "Package renamed",
        description: `Successfully renamed to "${updatedName}"`,
      })
      qc.setQueryData(["package", packageId], updatedPackage)
      qc.setQueryData(["packages", packageId], updatedPackage)
      if (updatedPackage?.name) {
        qc.setQueryData(["package", updatedPackage.name], updatedPackage)
      }
      qc.invalidateQueries({ queryKey: ["packages"] })
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !renamePackageMutation.isLoading) {
              renamePackageMutation.mutate()
            }
          }}
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
