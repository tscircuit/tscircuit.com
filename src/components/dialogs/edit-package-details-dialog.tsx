import { useState } from "react"
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
import { useMutation, useQueryClient, useQuery } from "react-query"
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
import { ChevronDown, Plus } from "lucide-react"
import { useLocation } from "wouter"
import { useDeletePackage } from "@/hooks/use-delete-package"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"

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
  currentGithubRepoFullName,
  isPrivate = false,
  unscopedPackageName,
  packageReleaseId,
  packageAuthor,
  onUpdate,
}: EditPackageDetailsDialogProps) => {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
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
    initialGithubRepoFullName: currentGithubRepoFullName,
    initialWebsite: currentWebsite,
    initialLicense: currentLicense || null,
    initialDefaultView: currentDefaultView,
    initialUnscopedPackageName: unscopedPackageName,
    isDialogOpen: open,
    initialVisibility: isPrivate ? "private" : "public",
  })

  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [dangerOpen, setDangerOpen] = useState(false)
  const [selectedRepository, setSelectedRepository] = useState<string>("")
  const [, setLocation] = useLocation()

  // Fetch available repositories
  const { data: repositoriesData, error: repositoriesError } = useQuery(
    ["github-repositories"],
    async () => {
      const response = await axios.get("/github/repos/list_available")
      return response.data
    },
    {
      enabled: open, // Only fetch when dialog is open
      retry: false,
    },
  )

  const handleConnectMoreRepos = async () => {
    window.location.href = `${apiBaseUrl}/github/installations/create_new_installation_redirect?return_to_page=${window.location.pathname}`
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
                <div className="space-y-1">
                  <Label htmlFor="repository">GitHub Repository</Label>
                  {(repositoriesError as any)?.response?.status === 400 &&
                  (repositoriesError as any)?.response?.data?.error_code ===
                    "github_not_connected" ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Connect your GitHub account to link this package to a
                        repository.
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleConnectMoreRepos}
                        className="w-full"
                        disabled={updatePackageDetailsMutation.isLoading}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                        Connect GitHub Account
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select
                        value={selectedRepository}
                        onValueChange={(value) => {
                          if (value === "connect-more") {
                            handleConnectMoreRepos()
                          } else {
                            setSelectedRepository(value)
                          }
                        }}
                        disabled={updatePackageDetailsMutation.isLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a repository" />
                        </SelectTrigger>
                        <SelectContent className="!z-[999]">
                          {repositoriesData?.repos?.map((repo: any) => (
                            <SelectItem
                              key={repo.full_name}
                              value={repo.full_name}
                            >
                              <div className="flex items-center space-x-2">
                                <span>{repo.unscoped_name}</span>
                                {repo.private && (
                                  <span className="text-xs text-muted-foreground">
                                    (private)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="connect-more">
                            <div className="flex items-center space-x-2 text-blue-600">
                              <Plus className="w-3 h-3" />
                              <span>Connect More Repos</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <details
                className="mt-2 rounded-md"
                onToggle={(e) => setDangerOpen(e.currentTarget.open)}
              >
                <summary className="select-none cursor-pointer p-2 font-medium text-sm text-black list-none flex justify-between items-center">
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
                      disabled={deletePackageMutation.isLoading}
                      className="shrink-0 lg:w-[115px] w-[70px]"
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
