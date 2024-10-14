import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { createUseDialog } from "./create-use-dialog"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "react-query"

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
  const [pending, setPending] = useState(false)

  const handleRename = async () => {
    try {
      setPending(true)
      await axios.post("/snippets/update", {
        snippet_id: snippetId,
        unscoped_name: newName,
      })
      onRename?.(newName)
      onOpenChange(false)
      setPending(false)
      toast({
        title: "Snippet renamed",
        description: `Successfully renamed to "${newName}"`,
      })
      qc.invalidateQueries({ queryKey: ["snippets"] })
    } catch (error) {
      console.error("Error renaming snippet:", error)
      toast({
        title: "Error",
        description: "Failed to rename the snippet. Please try again.",
        variant: "destructive",
      })
    }
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
        />
        <Button disabled={pending} onClick={handleRename}>
          {pending ? "Renaming..." : "Rename"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export const useRenameSnippetDialog = createUseDialog(RenameSnippetDialog)
