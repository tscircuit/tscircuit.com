import { useEffect, useMemo, useState } from "react"
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
  DialogFooter,
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
import { GitHubRepositorySelector } from "./GitHubRepositorySelector"
import { normalizeName } from "@/lib/utils/normalizeName"
import { useListUserOrgs } from "@/hooks/use-list-user-orgs"

interface EditPackageDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  currentDescription: string
  currentWebsite: string
  currentLicense?: string | null
  currentDefaultView?: string
  currentGithubRepoFullName?: string | null
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
    newAllowPrPreviews?: boolean,
  ) => void
  currentAllowPrPreviews?: boolean
  ownerOrgId?: string
}

export const EditPackageDetailsDialog = ({
  open,
  onOpenChange,
  packageId,
  currentDescription,
  currentWebsite,
  currentLicense,
  currentDefaultView = "files",
  currentGithubRepoFullName,
  isPrivate = false,
  unscopedPackageName,
  packageReleaseId,
  packageAuthor,
  currentAllowPrPreviews,
  onUpdate,
  ownerOrgId,
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
    initialGithubRepoFullName: currentGithubRepoFullName ?? null,
    initialWebsite: currentWebsite,
    initialLicense: currentLicense || null,
    initialDefaultView: currentDefaultView,
    initialUnscopedPackageName: unscopedPackageName,
    isDialogOpen: open,
    initialVisibility: isPrivate ? "private" : "public",
    initialAllowPrPreviews: currentAllowPrPreviews,
  })

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false)
  const [dangerOpen, setDangerOpen] = useState(false)
  const [targetOrgId, setTargetOrgId] = useState("")
  const [, setLocation] = useLocation()
  const { data: organizations = [] } = useListUserOrgs()

  const normalizedPackageName = useMemo(() => {
    if (!formData.unscopedPackageName.trim()) return ""
    return normalizeName(formData.unscopedPackageName)
  }, [formData.unscopedPackageName])

  useEffect(() => {
    if (open) {
      setTargetOrgId("")
      setShowConfirmTransfer(false)
    }
  }, [open])

  const availableOrgs = useMemo(
    () => organizations.filter((org) => org.org_id !== ownerOrgId),
    [organizations, ownerOrgId],
  )

  const selectedTransferOrg = useMemo(
    () => availableOrgs.find((org) => org.org_id === targetOrgId),
    [availableOrgs, targetOrgId],
  )

  const deletePackageMutation = useDeletePackage({
    onSuccess: async () => {
      await qc.invalidateQueries(["packages"]) // Invalidate the packages query
      onOpenChange(false) // Close the dialog
      setLocation("/dashboard") // Redirect to the dashboard
    },
  })

  const transferPackageMutation = useMutation({
    mutationFn: async () => {
      if (!targetOrgId) {
        throw new Error("Please select an organization to transfer to.")
      }

      const response = await axios.post("/packages/transfer", {
        package_id: packageId,
        target_org_id: targetOrgId,
      })

      if (response.status !== 200) {
        throw new Error("Failed to transfer package")
      }

      return response.data.package
    },
    onSuccess: async () => {
      await qc.invalidateQueries(["packages"])
      await qc.invalidateQueries(["packages", packageId])
      setShowConfirmTransfer(false)
      onOpenChange(false)
      toast({
        title: "Package transferred",
        description: "The package has been transferred successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          (error as any)?.data?.error?.message ||
          (error as Error).message ||
          "Failed to transfer package. Please try again.",
        variant: "destructive",
      })
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
        allow_pr_previews: formData.allowPrPreviews,
        github_repo_full_name:
          formData.githubRepoFullName === "unlink//repo"
            ? null
            : formData.githubRepoFullName,
        ...(normalizedPackageName !== unscopedPackageName && {
          name: normalizedPackageName,
        }),
      })
      if (response.status !== 200)
        throw new Error("Failed to update package details")

      const filesRes = await axios.get("/package_files/list", {
        params: {
          package_name_with_version: `${packageAuthor}/${normalizedPackageName}`,
        },
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
            package_name_with_version: `${packageAuthor}/${normalizedPackageName}`,
            file_path: "LICENSE",
          })
        }
        if (licenseContent) {
          await axios.post("/package_files/create_or_update", {
            package_name_with_version: `${packageAuthor}/${normalizedPackageName}`,
            file_path: "LICENSE",
            content_text: licenseContent,
          })
        }
      }

      if (normalizedPackageName !== unscopedPackageName) {
        window.history.replaceState(
          {},
          "",
          `/${packageAuthor}/${normalizedPackageName}`,
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
      qc.invalidateQueries("packageFile")
      qc.invalidateQueries(["packageFiles", packageReleaseId])
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
      <Dialog
        open={open && !showConfirmDelete && !showConfirmTransfer}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="sm:max-w-[500px] lg:h-[85vh] sm:h-[90vh] overflow-y-auto no-scrollbar w-[95vw] h-[80vh] p-6 gap-6 rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Package Details</DialogTitle>
            <DialogDescription>
              Update your package's description, website, visibility, or delete
              it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-10">
            <div>
              <div className="grid gap-2">
                <div className="space-y-1">
                  <Label htmlFor="packageName">Package Name</Label>
                  <Input
                    id="packageName"
                    value={formData.unscopedPackageName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unscopedPackageName: e.target.value,
                      }))
                    }
                    placeholder="my-awesome-package"
                    disabled={updatePackageDetailsMutation.isLoading}
                    className="w-full"
                    autoComplete="off"
                  />
                  {formData.unscopedPackageName.trim() &&
                    normalizedPackageName !==
                      formData.unscopedPackageName.trim() &&
                    normalizedPackageName && (
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                        <span>Will be saved as:</span>
                        <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-mono break-all">
                          {`${packageAuthor}/${normalizedPackageName}`}
                        </code>
                      </div>
                    )}
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
                <div className="space-y-1">
                  <GitHubRepositorySelector
                    selectedRepository={formData.githubRepoFullName || ""}
                    setSelectedRepository={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        githubRepoFullName: value,
                      }))
                    }
                    disabled={updatePackageDetailsMutation.isLoading}
                    open={open}
                    formData={formData}
                    addFormContent={(content) => {
                      setFormData((prev) => ({
                        ...prev,
                        ...content,
                      }))
                    }}
                    orgId={ownerOrgId}
                  />
                </div>
              </div>

              <details
                className="mt-4 rounded-lg border border-red-200 dark:border-red-900/50"
                onToggle={(e) => setDangerOpen(e.currentTarget.open)}
              >
                <summary className="select-none cursor-pointer px-4 py-3 font-medium text-sm text-red-600 dark:text-red-400 list-none flex justify-between items-center bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                  Danger Zone
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${dangerOpen ? "rotate-180" : ""}`}
                  />
                </summary>
                <div className="p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm font-medium">Transfer ownership</p>
                      <Select
                        value={targetOrgId}
                        onValueChange={setTargetOrgId}
                        disabled={
                          transferPackageMutation.isLoading ||
                          availableOrgs.length === 0
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent className="!z-[999]">
                          {availableOrgs.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No organizations available
                            </SelectItem>
                          ) : (
                            availableOrgs.map((org) => (
                              <SelectItem key={org.org_id} value={org.org_id}>
                                {org.display_name ||
                                  org.tscircuit_handle ||
                                  org.github_handle ||
                                  org.org_id}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowConfirmTransfer(true)}
                      disabled={
                        !targetOrgId || transferPackageMutation.isLoading
                      }
                      className="sm:w-auto w-full"
                    >
                      {transferPackageMutation.isLoading
                        ? "Transferring..."
                        : "Transfer"}
                    </Button>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Delete package</p>
                      <p className="text-xs text-muted-foreground">
                        This action cannot be undone
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowConfirmDelete(true)}
                      disabled={deletePackageMutation.isLoading}
                      className="sm:w-auto w-full"
                    >
                      {deletePackageMutation.isLoading
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </div>
                </div>
              </details>
            </div>
          </div>

          <DialogFooter className="mt-auto">
            <div className="lg:px-2 select-none flex flex-col sm:flex-row justify-end gap-2">
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
                  !isFormValid ||
                  !normalizedPackageName
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
      <Dialog open={showConfirmTransfer} onOpenChange={setShowConfirmTransfer}>
        <DialogContent className="w-[90vw] p-6 rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-left">Confirm Transfer</DialogTitle>
            <DialogDescription className="text-left">
              {selectedTransferOrg
                ? `Transfer this package to ${
                    selectedTransferOrg.display_name ||
                    selectedTransferOrg.tscircuit_handle ||
                    selectedTransferOrg.github_handle ||
                    selectedTransferOrg.org_id
                  }?`
                : "Select an organization to transfer this package to."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowConfirmTransfer(false)}
              disabled={transferPackageMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => transferPackageMutation.mutate()}
              disabled={
                transferPackageMutation.isLoading || !selectedTransferOrg
              }
            >
              {transferPackageMutation.isLoading
                ? "Transferring..."
                : "Confirm transfer"}
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
