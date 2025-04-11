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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getLicenseContent } from "../ViewPackagePage/utils/get-license-content"

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
  currentLicense,
  onUpdate,
  packageAuthor,
  packageName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  currentDescription: string
  currentWebsite: string
  currentLicense?: string | null
  packageAuthor?: string | null
  packageName: string
  onUpdate?: (
    newDescription: string,
    newWebsite: string,
    newLicense: string | null,
  ) => void
}) => {
  const [description, setDescription] = useState(currentDescription)
  const [website, setWebsite] = useState(currentWebsite)
  const [license, setLicense] = useState<string | null>(currentLicense || null)
  const [websiteError, setWebsiteError] = useState<string | null>(null)
  const axios = useAxios()
  const { toast } = useToast()
  const qc = useQueryClient()

  useEffect(() => {
    if (open) {
      setDescription(currentDescription)
      setWebsite(currentWebsite)
      setLicense(currentLicense || null)
      setWebsiteError(null)
    }
  }, [open, currentDescription, currentWebsite, currentLicense])

  useEffect(() => {
    if (website && !isValidUrl(website)) {
      setWebsiteError("Please enter a valid URL (e.g., https://tscircuit.com)")
    } else {
      setWebsiteError(null)
    }
  }, [website])

  const hasChanges = useMemo(() => {
    return (
      description !== currentDescription ||
      website !== currentWebsite ||
      license !== currentLicense
    )
  }, [
    description,
    website,
    license,
    currentDescription,
    currentWebsite,
    currentLicense,
  ])

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
        license: license,
      })
      if (response.status !== 200) {
        console.error("Failed to update package details:", response.data)
        throw new Error("Failed to update package details")
      }
      // get package files list
      const packageFiles = []
      const packageFilesResponse = await axios.post("/package_files/list", {
        package_name_with_version: `${packageName}`,
      })
      if (packageFilesResponse.status == 200) {
        packageFiles.push(
          ...packageFilesResponse.data.package_files.map(
            (x: { file_path: string }) => x.file_path,
          ),
        )
      }
      // Create LICENSE file if a license is selected
      if (packageFiles.includes("LICENSE") && license && license !== "unset") {
        // Update already present license file
        alert("Update already present license file has to be implemented")
        // await axios.post("/package_files/update", {
        //   package_name_with_version: `${packageName}`,
        //   file_path: "LICENSE",
        //   content_text: getLicenseContent(license, packageAuthor),
        // })
      } else if (license && license !== "unset") {
        const licenseContent = getLicenseContent(license, packageAuthor)
        if (!licenseContent) return
        // Create the LICENSE file
        await axios.post("/package_files/create", {
          package_name_with_version: `${packageName}`,
          file_path: "LICENSE",
          content_text: licenseContent,
        })
        try {
          window.location.reload()
        } catch {}
      } else if (license && license === "unset") {
        // Delete the LICENSE file
        alert("Delete the LICENSE file has to be implemented")
        // await axios.post("/package_files/delete", {
        //   package_name_with_version: `${packageName}`,
        //   file_path: "LICENSE",
        // })
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
        license: license,
      }))
      return { previousPackage }
    },
    onSuccess: () => {
      onUpdate?.(description, website, license)
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
      <DialogContent className="sm:max-w-[425px] rounded-sm w-[95vw] sm:w-full p-4 sm:p-6 gap-4">
        <DialogHeader className="space-y-2">
          <DialogTitle>Edit package details</DialogTitle>
          <DialogDescription>
            Update the website URL and description for your package.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              disabled={updatePackageDetailsMutation.isLoading}
              aria-invalid={!!websiteError}
              className="w-full"
            />
            {websiteError && (
              <p className="text-sm text-red-500 mt-1">{websiteError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="license">License</Label>
            <Select
              value={license || "unset"}
              onValueChange={(value) =>
                setLicense(value === "unset" ? null : value)
              }
              disabled={updatePackageDetailsMutation.isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a license" />
              </SelectTrigger>
              <SelectContent className="!z-[999]">
                <SelectItem value="MIT">MIT</SelectItem>
                <SelectItem value="unset">Unset</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter package description"
              disabled={updatePackageDetailsMutation.isLoading}
              className="resize-none min-h-[100px] w-full"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updatePackageDetailsMutation.isLoading}
            className="sm:w-auto w-full"
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
            className="sm:w-auto w-full"
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
