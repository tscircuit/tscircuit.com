import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { useState } from "react"
import { createUseDialog } from "./create-use-dialog"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "react-query"
import { useLocation } from "wouter"

export const ConfirmDeleteSnippetDialog = ({
  open,
  onOpenChange,
  snippetId,
  snippetName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  snippetId: string
  snippetName: string
}) => {
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [pending, setPending] = useState(false)
  const [, navigate] = useLocation()

  const handleDelete = async () => {
    try {
      setPending(true)
      await axios.post("/snippets/delete", {
        snippet_id: snippetId,
      })
      onOpenChange(false)
      setPending(false)
      toast({
        title: "Snippet deleted",
        description: `Successfully deleted "${snippetName}"`,
      })
      qc.invalidateQueries({ queryKey: ["snippets"] })
      navigate("/dashboard")
    } catch (error) {
      console.error("Error deleting snippet:", error)
      toast({
        title: "Error",
        description: "Failed to delete the snippet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete Snippet</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete the snippet "{snippetName}"?</p>
        <p>This action cannot be undone.</p>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useConfirmDeleteSnippetDialog = createUseDialog(
  ConfirmDeleteSnippetDialog,
)
