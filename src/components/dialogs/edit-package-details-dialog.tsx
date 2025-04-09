import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { useState, useEffect, useMemo } from "react"
import { useMutation, useQueryClient } from "react-query"
import { createUseDialog } from "./create-use-dialog"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

const isValidUrl = (url: string): boolean => {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export const EditPackageDetailsDialog = ({
  open,
  onOpenChange,
  packageId,
  currentDescription,
  currentWebsite,
  onUpdate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  currentDescription: string
  currentWebsite: string
  onUpdate?: (newDescription: string, newWebsite: string) => void
}) => {
  const [description, setDescription] = useState(currentDescription)
  const [website, setWebsite] = useState(currentWebsite)
  const [websiteError, setWebsiteError] = useState<string | null>(null)
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  useEffect(() => {
    if (open) {
      setDescription(currentDescription)
      setWebsite(currentWebsite)
      setWebsiteError(null)
    }
  }, [open, currentDescription, currentWebsite])

  useEffect(() => {
    if (website && !isValidUrl(website)) {
      setWebsiteError("Please enter a valid URL (e.g., https://tscircuit.com)")
    } else {
      setWebsiteError(null)
    }
  }, [website])

  const hasChanges = useMemo(() => {
    return description !== currentDescription || website !== currentWebsite
  }, [description, website, currentDescription, currentWebsite])

  const isFormValid = useMemo(() => {
    return !websiteError
  }, [websiteError])

  const updatePackageDetailsMutation = useMutation({
    mutationFn: async () => {
      if (!isFormValid) {
        throw new Error("Please fix the form errors before submitting")
      }

      const response = await axios.post("/packages/update", {
        package_id: packageId,
        description: description,
        website: website,
      })
      if (response.status !== 200) {
        console.error("Failed to update package details:", response.data)
        throw new Error("Failed to update package details")
      }
      return response.data
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["packages", packageId] })
      const previousPackage = qc.getQueryData(["packages", packageId])
      qc.setQueryData(["packages", packageId], (old: any) => ({
        ...old,
        description: description,
        website: website,
      }))
      return { previousPackage }
    },
    onSuccess: () => {
      onUpdate?.(description, website)
      onOpenChange(false)
      toast({
        title: "Package details updated",
        description: "Successfully updated package details",
      })
    },
    onError: (error, _, context) => {
      qc.setQueryData(["packages", packageId], context?.previousPackage)
      console.error("Error updating package details:", error)
      toast({
        title: "Error",
        description: "Failed to update package details. Please try again.",
        variant: "destructive",
      })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["packages", packageId] })
      qc.invalidateQueries({ queryKey: ["current-package-info"] })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit package details</DialogTitle>
          <DialogDescription>
            Update the website URL and description for your package.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              disabled={updatePackageDetailsMutation.isLoading}
              aria-invalid={!!websiteError}
            />
            {websiteError && (
              <p className="text-sm text-red-500 mt-1">{websiteError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter package description"
              disabled={updatePackageDetailsMutation.isLoading}
              className="resize-none min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updatePackageDetailsMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            disabled={
              updatePackageDetailsMutation.isLoading ||
              !hasChanges ||
              !isFormValid
            }
            onClick={() => updatePackageDetailsMutation.mutate()}
          >
            {updatePackageDetailsMutation.isLoading
              ? "Updating..."
              : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useEditPackageDetailsDialog = createUseDialog(
  EditPackageDetailsDialog,
)
