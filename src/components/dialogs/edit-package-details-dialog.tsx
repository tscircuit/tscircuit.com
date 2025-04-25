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
import { ChevronDown } from "lucide-react"
import { useLocation } from "wouter"
import { useDeletePackage } from "@/hooks/use-delete-package"

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
    initialVisibility: isPrivate ? "private": "public"
  })

  const [deleting, setDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [dangerOpen, setDangerOpen] = useState(false)
  const [, setLocation] = useLocation()


  // const handleChangeVisibility = async (newVisibility: string) => {
  //   if (savingVisibility) return
  //   setSavingVisibility(true)
  //   try {
  //     const newPrivacy = newVisibility === "private" ? true : false
  //     const res = await axios.post("/snippets/update", {
  //       snippet_id: packageId,
  //       is_private: newPrivacy,
  //     })
  //     if (res.status === 200) {
  //       setVisibility(newVisibility)
  //       toast({
  //         title: "Visibility updated",
  //         description: `Package is now ${newVisibility}.`,
  //       })
  //       await qc.invalidateQueries(["packages", packageId])
  //     }
  //   } catch (err: any) {
  //     toast({
  //       title: "Failed to update visibility",
  //       description: err.message,
  //       variant: "destructive",
  //     })
  //     console.error(err)
  //   } finally {
  //     setSavingVisibility(false)
  //   }
  // }

  const handleDelete = async () => {
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
        setLocation("/dashboard")
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
      setShowConfirmDelete(false)
    }
  }
  const deletePackageMutation = useDeletePackage({
    onSuccess: async () => {
      await qc.invalidateQueries(["packages"]) // Invalidate the packages query
      onOpenChange(false) // Close the dialog
      setLocation("/dashboard") // Redirect to the dashboard
    },
  })
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
        is_private: formData.visibility == "private",
      })
      const privacyUpdateResponse = await axios.post("/snippets/update", {
        snippet_id: packageId,
        is_private: formData.visibility === "private",
      })
      console.log("Data",privacyUpdateResponse)
      if (response.status !== 200)
        throw new Error("Failed to update package details")

      const filesRes = await axios.post("/package_files/list", {
        package_name_with_version: packageName,
      })
      console.log("Res ::::::::",filesRes)
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
        visibility: formData.visibility,
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
        is_private: formData.visibility == "private",
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
    <div>
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="max-w-md p-6 rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-left">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-left">
              Are you sure you want to delete this package? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDelete(false)}
              disabled={deletePackageMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deletePackageMutation.mutate({package_id: packageId})
              }}
              disabled={deletePackageMutation.isLoading}
            >
              {deletePackageMutation.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={open !== showConfirmDelete} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] lg:h-[70vh] sm:h-[90vh] overflow-y-auto w-[95vw] p-6 gap-6 rounded-2xl shadow-lg">
          <DialogHeader>
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
                  setFormData((prev) => ({
                    ...prev,
                    website: e.target.value,
                  }))
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
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(val) => {
                  setFormData((prev) => ({
                    ...prev,
                    visibility: val
                  }))
                }}
                disabled={
                updatePackageDetailsMutation.isLoading
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="!z-[999]">
                  <SelectItem value="public">public</SelectItem>
                  <SelectItem value="private">private</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="MIT">MIT</SelectItem>
                  <SelectItem value="Apache-2.0">Apache-2.0</SelectItem>
                  <SelectItem value="BSD-3-Clause">BSD-3-Clause</SelectItem>
                  <SelectItem value="GPL-3.0">GPL-3.0</SelectItem>
                  <SelectItem value="unset">Unset</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <details
            className="mt-2 rounded-md"
            onToggle={(e) => setDangerOpen(e.currentTarget.open)}
          >
            <summary className="cursor-pointer p-2 font-medium text-sm text-black list-none flex justify-between items-center">
              Danger Zone
              <ChevronDown
                className={`w-4 h-4 mr-1 transition-transform ${dangerOpen ? "rotate-180" : ""}`}
              />
            </summary>
            <div className="p-2 pr-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Once deleted, it cannot be recovered.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="default"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={deleting}
                  className="shrink-0 lg:w-[115px] w-[70px]"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </details>

          <div className=" lg:px-2 flex flex-col sm:flex-row justify-end gap-3">
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
    </div>
  )
}

export const useEditPackageDetailsDialog = createUseDialog(
  EditPackageDetailsDialog,
)
