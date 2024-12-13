import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { createUseDialog } from "./create-use-dialog"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"

type EditDatasheetUrlDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  snippetId: string
  currentUrl: string | null
}

export const EditDatasheetUrlDialog = ({
  open,
  onOpenChange,
  snippetId,
  currentUrl,
}: EditDatasheetUrlDialogProps) => {
  const [url, setUrl] = useState(currentUrl ?? "")
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  const updateDatasheetUrlMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/snippets/update", {
        snippet_id: snippetId,
        datasheet_url: url || null,
      })
      if (response.status !== 200) {
        throw new Error("Failed to update datasheet URL")
      }
      return response.data
    },
    onSuccess: () => {
      onOpenChange(false)
      toast({
        title: "Datasheet URL updated",
        description: url ? "Successfully updated datasheet URL" : "Removed datasheet URL",
      })
      qc.invalidateQueries({ queryKey: ["snippets", snippetId] })
    },
    onError: (error) => {
      console.error("Error updating datasheet URL:", error)
      toast({
        title: "Error",
        description: "Failed to update the datasheet URL. Please try again.",
        variant: "destructive",
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Datasheet URL</DialogTitle>
        </DialogHeader>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter datasheet URL"
          type="url"
          disabled={updateDatasheetUrlMutation.isLoading}
        />
        <Button
          disabled={updateDatasheetUrlMutation.isLoading}
          onClick={() => updateDatasheetUrlMutation.mutate()}
        >
          {updateDatasheetUrlMutation.isLoading ? "Updating..." : "Update"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export const useEditDatasheetUrlDialog = createUseDialog(EditDatasheetUrlDialog)
