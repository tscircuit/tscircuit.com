import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { createUseDialog } from "./create-use-dialog"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"

export const RenameSnippetDialog = ({
  open,
  onOpenChange,
  snippetId,
  currentName,
  onRename,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  snippetId: string
  currentName: string
  onRename?: (newName: string) => void
}) => {
  const [newName, setNewName] = useState(currentName)
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  const renameSnippetMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/snippets/update", {
        snippet_id: snippetId,
        unscoped_name: newName,
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
        title: "Snippet renamed",
        description: `Successfully renamed to "${newName}"`,
      })
      qc.invalidateQueries({ queryKey: ["snippets", snippetId] })
    },
    onError: (error) => {
      console.error("Error renaming snippet:", error)
      toast({
        title: "Error",
        description: "Failed to rename the snippet. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleRename = () => {
    renameSnippetMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Snippet</DialogTitle>
        </DialogHeader>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new name"
          disabled={renameSnippetMutation.isLoading}
        />
        <Button
          disabled={renameSnippetMutation.isLoading}
          onClick={handleRename}
        >
          {renameSnippetMutation.isLoading ? "Renaming..." : "Rename"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export const useRenameSnippetDialog = createUseDialog(RenameSnippetDialog)
