import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { createUseDialog } from "./create-use-dialog"

export const UpdatePackageDescriptionDialog = ({
  open,
  onOpenChange,
  packageId,
  currentDescription,
  onUpdate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  currentDescription: string
  onUpdate?: (newDescription: string) => void
}) => {
  const [newDescription, setNewDescription] = useState(currentDescription)
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  const updateDescriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/packages/update", {
        package_id: packageId,
        description: newDescription,
      })
      if (response.status !== 200) {
        throw new Error("Failed to update description")
      }
      return response.data
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["packages", packageId] })
      const previousSnippet = qc.getQueryData(["packages", packageId])
      qc.setQueryData(["packages", packageId], (old: any) => ({
        ...old,
        description: newDescription,
      }))
      return { previousSnippet }
    },
    onSuccess: () => {
      onUpdate?.(newDescription)
      onOpenChange(false)
      toast({
        title: "Description updated",
        description: "Successfully updated package description",
      })
    },
    onError: (error, variables, context) => {
      qc.setQueryData(["packages", packageId], context?.previousSnippet)
      console.error("Error updating description:", error)
      toast({
        title: "Error",
        description: "Failed to update package description. Please try again.",
        variant: "destructive",
      })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["packages", packageId] })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Package Description</DialogTitle>
        </DialogHeader>
        <Textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Enter new description"
          disabled={updateDescriptionMutation.isLoading}
          className="resize-none min-h-[80px]"
        />
        <Button
          disabled={updateDescriptionMutation.isLoading}
          onClick={() => updateDescriptionMutation.mutate()}
        >
          {updateDescriptionMutation.isLoading ? "Updating..." : "Update"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export const useUpdatePackageDescriptionDialog = createUseDialog(
  UpdatePackageDescriptionDialog,
)
