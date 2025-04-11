"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { createUseDialog } from "./create-use-dialog"
import { useUpdatePackageLicenseMutation } from "@/hooks/use-update-package-license-mutation"

const COMMON_LICENSES = [
  { value: "MIT", label: "MIT License" },
  { value: "Apache-2.0", label: "Apache License 2.0" },
  { value: "GPL-3.0", label: "GNU General Public License v3.0" },
  { value: "BSD-3-Clause", label: "BSD 3-Clause License" },
  { value: "ISC", label: "ISC License" },
  { value: "UNLICENSED", label: "Unlicensed" },
] as const

interface EditPackageLicenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageReleaseId: string
  currentLicense: string | null
  onUpdate?: () => void
}

export const EditPackageLicenseDialog = ({
  open,
  onOpenChange,
  packageReleaseId,
  currentLicense,
  onUpdate,
}: EditPackageLicenseDialogProps): ReactElement => {
  const [license, setLicense] = useState(currentLicense || "")
  const { mutate: updateLicense, isLoading } = useUpdatePackageLicenseMutation({
    onSuccess: () => {
      onUpdate?.()
      onOpenChange(false)
    },
  })

  const handleSave = () => {
    updateLicense({
      package_release_id: packageReleaseId,
      license,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update License</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license">License</Label>
              <Select
                value={license}
                onValueChange={setLicense}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a license" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_LICENSES.map((license) => (
                    <SelectItem key={license.value} value={license.value}>
                      {license.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useEditPackageLicenseDialog = createUseDialog(EditPackageLicenseDialog) 