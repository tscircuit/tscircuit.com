import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAxios } from "@/hooks/useAxios"
import { useDeletePackage } from "@/hooks/use-delete-package"
import { usePackageDetailsForm } from "@/hooks/use-package-details-form"
import { useToast } from "@/hooks/useToast"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import { useLocation } from "wouter"
import { getLicenseContent } from "../ViewPackagePage/utils/get-license-content"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  currentDefaultView?: string
  isPrivate?: boolean
  packageName: string
  unscopedPackageName: string
  packageReleaseId: string | null
  packageAuthor?: string | null
  onUpdate?: (
    newDescription: string,
    newWebsite: string,
    newLicense: string | null,
    newDefaultView: string,
  ) => void
}

export const EditPackageDetailsDialog = ({
  open,
  onOpenChange,
  packageId,
  currentDescription,
  currentWebsite,
  currentLicense,
  currentDefaultView = "files",
  isPrivate = false,
  unscopedPackageName,
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
    initialDefaultView: currentDefaultView,
    initialUnscopedPackageName: unscopedPackageName,
    isDialogOpen: open,
    initialVisibility: isPrivate ? "private" : "public",
  })

  const [deleting, setDeleting] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [dangerOpen, setDangerOpen] = useState(false)
  const [, setLocation] = useLocation()

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
        description: formData.description.trim(),
        website: formData.website.trim(),
        is_private: formData.visibility == "private",
        default_view: formData.defaultView,
        ...(formData.unscopedPackageName !== unscopedPackageName && {
          name: formData.unscopedPackageName.trim(),
        }),
      })
      if (response.status !== 200)
        throw new Error("Failed to update package details")

      const filesRes = await axios.post("/package_files/list", {
        package_name_with_version: `${packageAuthor}/${formData.unscopedPackageName}`,
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
            package_name_with_version: `${packageAuthor}/${formData.unscopedPackageName}`,
            file_path: "LICENSE",
          })
        }
        if (licenseContent) {
          await axios.post("/package_files/create_or_update", {
            package_name_with_version: `${packageAuthor}/${formData.unscopedPackageName}`,
            file_path: "LICENSE",
            content_text: licenseContent,
          })
        }
      }

      if (formData.unscopedPackageName !== unscopedPackageName) {
        // Use router for client-side navigation
        window.history.replaceState(
          {},
          "",
          `/${packageAuthor}/${formData.unscopedPackageName}`,
        )
      }

      return {
        description: formData.description,
        website: formData.website,
        license: formData.license,
        visibility: formData.visibility,
        defaultView: formData.defaultView,
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
        default_view: formData.defaultView,
      }))
      return { previous }
    },
    onSuccess: (data) => {
      onUpdate?.(data.description, data.website, data.license, data.defaultView)
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
        description:
          (error as any)?.data?.error?.message ||
          "Failed to update package details. Please try again.",
        variant: "destructive",
      })
    },
    onSettled: () => qc.invalidateQueries(["packages", packageId]),
  })

  return (
    <div>
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="w-[90vw] p-6 rounded-2xl shadow-lg">
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
                deletePackageMutation.mutate({ package_id: packageId })
              }}
              disabled={deletePackageMutation.isLoading}
            >
              {deletePackageMutation.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={open !== showConfirmDelete} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] lg:h-[85vh] sm:h-[90vh] overflow-y-auto no-scrollbar w-[95vw] h-[80vh] p-6 gap-6 rounded-2xl shadow-lg">
          <div className="flex flex-col gap-10">
            <DialogHeader>
              <DialogTitle>Edit Package Details</DialogTitle>
              <DialogDescription>
                Update your package's description, website, visibility, or
                delete it.
              </DialogDescription>
            </DialogHeader>
            <div className="">
              <div className="grid gap-2">
                <div className="space-y-1">
                  <Label htmlFor="packageName">Package Name</Label>
                  <Input
                    id="packageName"
                    value={formData.unscopedPackageName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unscopedPackageName: e.target.value.replace(/\s+/g, ""),
                      }))
                    }
                    placeholder="Enter package name"
                    disabled={updatePackageDetailsMutation.isLoading}
                    className="w-full"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    autoComplete="off"
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
                        visibility: val,
                      }))
                    }}
                    disabled={updatePackageDetailsMutation.isLoading}
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
                    spellCheck={false}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter package description"
                    disabled={updatePackageDetailsMutation.isLoading}
                    className="w-full min-h-[80px] resize-none"
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
                <div className="space-y-1">
                  <Label htmlFor="defaultView">Default View</Label>
                  <Select
                    value={formData.defaultView}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultView: value,
                      }))
                    }
                    disabled={updatePackageDetailsMutation.isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent className="!z-[999]">
                      <SelectItem value="files">Files</SelectItem>
                      <SelectItem value="3d">3D</SelectItem>
                      <SelectItem value="pcb">PCB</SelectItem>
                      <SelectItem value="schematic">Schematic</SelectItem>
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
            </div>
          </div>

          <DialogFooter className="mt-auto">
            <div className="lg:px-2 flex flex-col sm:flex-row justify-end gap-2">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const useEditPackageDetailsDialog = createUseDialog(
  EditPackageDetailsDialog,
)
