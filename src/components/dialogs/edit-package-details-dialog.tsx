import React, { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAxios } from "@/hooks/use-axios"
import { usePackageDetailsForm } from "@/hooks/use-package-details-form"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "react-query"
import { getLicenseContent } from "../ViewPackagePage/utils/get-license-content"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { createUseDialog } from "./create-use-dialog"

interface EditPackageDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  currentDescription: string
  currentWebsite: string
  currentLicense?: string | null
  isPrivate?: boolean
  packageName: string
  packageReleaseId: string | null
  packageAuthor?: string | null
  onUpdate?: (
    newDescription: string,
    newWebsite: string,
    newLicense: string | null,
  ) => void
}

export const EditPackageDetailsDialog = ({
  open,
  onOpenChange,
  packageId,
  currentDescription,
  currentWebsite,
  currentLicense,
  isPrivate = false,
  packageName,
  packageReleaseId,
  packageAuthor,
  onUpdate,
}: EditPackageDetailsDialogProps) => {
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  const {
    formData,
    setFormData,
    websiteError,
    hasLicenseChanged,
    hasChanges,
    isFormValid,
  } = usePackageDetailsForm({
    initialDescription: currentDescription,
    initialWebsite: currentWebsite,
    initialLicense: currentLicense || null,
    isDialogOpen: open,
  })

  const [visibility, setVisibility] = useState(isPrivate ? "private" : "public")
  const [savingVisibility, setSavingVisibility] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setVisibility(isPrivate ? "private" : "public")
  }, [isPrivate])

  const handleChangeVisibility = async () => {
    if (savingVisibility) return
    setSavingVisibility(true)
    try {
      const newPrivacy = visibility === "private" ? false : true
      const res = await axios.post("/snippets/update", {
        snippet_id: packageId,
        is_private: newPrivacy,
      })
      if (res.status === 200) {
        const updated = newPrivacy ? "private" : "public"
        setVisibility(updated)
        toast({
          title: "Visibility updated",
          description: `Package is now ${updated}.`,
        })
        await qc.invalidateQueries(["packages", packageId])
      }
    } catch (err: any) {
      toast({
        title: "Failed to update visibility",
        description: err.message,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setSavingVisibility(false)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this package? This action cannot be undone.",
      )
    )
      return
    setDeleting(true)
    try {
      const res = await axios.post("/packages/delete", {
        package_id: packageId,
      })
      if (res.status === 200) {
        toast({
          title: "Package deleted",
          description: "Your package was successfully deleted.",
          variant: "destructive",
        })
        await qc.invalidateQueries(["packages"])
        onOpenChange(false)
      }
    } catch (err: any) {
      toast({
        title: "Failed to delete package",
        description: err.message,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const updatePackageDetailsMutation = useMutation({
    mutationFn: async () => {
      if (!isFormValid)
        throw new Error("Please fix the form errors before submitting")

      if (hasLicenseChanged) {
        await axios.post("/package_releases/update", {
          package_id: packageId,
          package_release_id: packageReleaseId,
          license: formData.license ?? "unset",
        })
      }

      const response = await axios.post("/packages/update", {
        package_id: packageId,
        description: formData.description,
        website: formData.website,
      })
      if (response.status !== 200)
        throw new Error("Failed to update package details")

      const filesRes = await axios.post("/package_files/list", {
        package_name_with_version: packageName,
      })
      const packageFiles: string[] =
        filesRes.status === 200
          ? filesRes.data.package_files.map((x: any) => x.file_path)
          : []
      const licenseContent = getLicenseContent(
        formData.license ?? "",
        packageAuthor,
      )

      if (hasLicenseChanged) {
        if (packageFiles.includes("LICENSE") && !licenseContent) {
          await axios.post("/package_files/delete", {
            package_name_with_version: packageName,
            file_path: "LICENSE",
          })
        }
        if (licenseContent) {
          await axios.post("/package_files/create_or_update", {
            package_name_with_version: packageName,
            file_path: "LICENSE",
            content_text: licenseContent,
          })
        }
      }

      return {
        description: formData.description,
        website: formData.website,
        license: formData.license,
      }
    },
    onMutate: async () => {
      await qc.cancelQueries(["packages", packageId])
      const previous = qc.getQueryData(["packages", packageId])
      qc.setQueryData(["packages", packageId], (old: any) => ({
        ...old,
        description: formData.description,
        website: formData.website,
        license: formData.license,
      }))
      return { previous }
    },
    onSuccess: (data) => {
      onUpdate?.(data.description, data.website, data.license)
      onOpenChange(false)
      qc.invalidateQueries([
        "packageFile",
        { package_release_id: packageReleaseId },
      ])
      toast({
        title: "Package details updated",
        description: "Successfully updated package details",
      })
    },
    onError: (error, _, context) => {
      qc.setQueryData(["packages", packageId], context?.previous)
      toast({
        title: "Error",
        description: "Failed to update package details. Please try again.",
        variant: "destructive",
      })
    },
    onSettled: () => qc.invalidateQueries(["packages", packageId]),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] p-6 gap-6 rounded-2xl shadow-lg">
        <DialogHeader className="space-y-2">
          <DialogTitle>Edit Package Details</DialogTitle>
          <DialogDescription>
            Update your package’s description, website, visibility, or delete
            it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="https://example.com"
              disabled={updatePackageDetailsMutation.isLoading}
              className="w-full"
              aria-invalid={!!websiteError}
            />
            {websiteError && (
              <p className="text-sm text-red-500">{websiteError}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter package description"
              disabled={updatePackageDetailsMutation.isLoading}
              className="w-full min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="license">License</Label>
            <Select
              value={formData.license || "unset"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  license: value === "unset" ? null : value,
                }))
              }
              disabled={updatePackageDetailsMutation.isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a license" />
              </SelectTrigger>
              <SelectContent className="!z-[999]">
                {["MIT", "Apache-2.0", "BSD-3-Clause", "GPL-3.0", "unset"].map(
                  (l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
          <p className="text-sm text-slate-500 text-muted-foreground mb-4">
            Caution: these actions are irreversible.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border border-gray-200 rounded-md p-4">
              <div>
                <p className="font-medium">Change Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Currently <strong>{visibility}</strong>.
                </p>
              </div>
              <Button
                size="default"
                onClick={handleChangeVisibility}
                disabled={savingVisibility}
                className="w-[115px]"
              >
                {savingVisibility
                  ? "Saving..."
                  : visibility === "private"
                    ? "Make Public"
                    : "Make Private"}
              </Button>
            </div>

            <div className="flex justify-between items-center border border-red-200 rounded-md p-4">
              <div>
                <p className="font-medium text-red-600">Delete Package</p>
                <p className="text-sm text-muted-foreground">
                  Once deleted, it cannot be recovered.
                </p>
              </div>
              <Button
                variant="destructive"
                size="default"
                onClick={handleDelete}
                disabled={deleting}
                className="shrink-0 w-[115px]"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updatePackageDetailsMutation.isLoading}
            className="sm:w-auto w-full"
          >
            Cancel
          </Button>
          <Button
            onClick={() => updatePackageDetailsMutation.mutate()}
            disabled={
              updatePackageDetailsMutation.isLoading ||
              !hasChanges ||
              !isFormValid
            }
            className="sm:w-auto lg:w-[115px]"
          >
            {updatePackageDetailsMutation.isLoading
              ? "Updating..."
              : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useEditPackageDetailsDialog = createUseDialog(
  EditPackageDetailsDialog,
)
