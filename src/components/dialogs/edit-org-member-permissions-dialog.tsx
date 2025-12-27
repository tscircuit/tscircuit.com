import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { useState, useEffect } from "react"
import { createUseDialog } from "./create-use-dialog"
import { useUpdateOrgMemberMutation } from "@/hooks/use-update-org-member-mutation"
import { useToast } from "@/hooks/use-toast"
import { Account, UserPermissions } from "fake-snippets-api/lib/db/schema"

export type SelectedMember = {
  member: Account
  orgId: string
  currentPermissions?: UserPermissions
}

type PermissionKey = keyof UserPermissions

const PERMISSIONS_CONFIG: {
  key: PermissionKey
  label: string
  description: string
}[] = [
  {
    key: "can_manage_org",
    label: "Can Manage Organization",
    description: "Allow member to manage organization settings and members",
  },
  // {
  //   key: "can_manage_package",
  //   label: "Can Manage Packages",
  //   description: "Allow member to create and manage organization packages",
  // },
]

export const EditOrgMemberPermissionsDialog = ({
  open,
  onOpenChange,
  selectedMember,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMember: SelectedMember | null
}) => {
  const [permissions, setPermissions] = useState<UserPermissions>({})
  const { toast } = useToast()

  useEffect(() => {
    setPermissions(selectedMember?.currentPermissions ?? {})
  }, [selectedMember, open])

  const updateMemberMutation = useUpdateOrgMemberMutation({
    onSuccess: () => {
      toast({
        title: "Permissions updated",
        description: `Successfully updated permissions for ${selectedMember?.member.tscircuit_handle || selectedMember?.member.account_id}`,
      })
      setTimeout(() => {
        onOpenChange(false)
      }, 100)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update permissions",
        variant: "destructive",
      })
    },
  })

  if (!selectedMember) return null

  const handlePermissionChange = (key: PermissionKey, checked: boolean) => {
    setPermissions((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSave = () => {
    updateMemberMutation.mutate({
      orgId: selectedMember.orgId,
      accountId: selectedMember.member.account_id,
      permissions,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Edit Permissions for{" "}
            {selectedMember.member.tscircuit_handle ||
              selectedMember.member.account_id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {PERMISSIONS_CONFIG.map(({ key, label, description }) => (
            <div key={key} className="flex items-start gap-3">
              <Checkbox
                id={key}
                checked={permissions[key] ?? false}
                onCheckedChange={(checked) =>
                  handlePermissionChange(key, checked === true)
                }
                disabled={updateMemberMutation.isLoading}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={key}
                  className="text-sm font-medium cursor-pointer block mb-1.5"
                >
                  {label}
                </Label>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMemberMutation.isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMemberMutation.isLoading}
            className="w-full sm:w-auto"
          >
            {updateMemberMutation.isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useEditOrgMemberPermissionsDialog = createUseDialog<
  any,
  { selectedMember: SelectedMember | null }
>(EditOrgMemberPermissionsDialog)
