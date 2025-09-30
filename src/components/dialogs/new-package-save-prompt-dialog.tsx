import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { createUseDialog } from "./create-use-dialog"
import { useListUserOrgs } from "@/hooks/use-list-user-orgs"

export const NewPackageSavePromptDialog = ({
  open,
  onOpenChange,
  initialIsPrivate = false,
  initialName = "",
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIsPrivate?: boolean
  initialName?: string
  onSave: ({
    name,
    isPrivate,
    orgId,
  }: {
    name?: string
    isPrivate: boolean
    orgId: string
  }) => void
}) => {
  const [packageName, setPackageName] = useState(initialName)
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate)
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const { data: organizations, isLoading: orgsLoading } = useListUserOrgs()

  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(
        organizations.find((x) => x.is_personal_org)?.org_id ||
          organizations[0].org_id,
      )
    }
  }, [organizations, selectedOrgId])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Creating new package</DialogTitle>
          <DialogDescription>
            Would you like to save this package?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Organization</Label>
            <Select
              value={selectedOrgId}
              onValueChange={setSelectedOrgId}
              disabled={orgsLoading}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2 flex-1">
                  {selectedOrgId && organizations ? (
                    <span className="truncate">
                      {organizations.find((org) => org.org_id === selectedOrgId)
                        ?.display_name ||
                        organizations.find(
                          (org) => org.org_id === selectedOrgId,
                        )?.name ||
                        `Org ${selectedOrgId.slice(0, 8)}`}
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      {orgsLoading
                        ? "Loading organizations..."
                        : "Select organization"}
                    </span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="!z-[999]">
                {organizations?.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-slate-500">
                    No organizations found
                  </div>
                ) : (
                  organizations?.map((org) => (
                    <SelectItem
                      key={org.org_id}
                      value={org.org_id}
                      className="cursor-pointer"
                    >
                      {org.display_name ||
                        org.name ||
                        `Org ${org.org_id.slice(0, 8)}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Package Name</Label>
            <Input
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Untitled Package"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="space-y-1 flex-1">
                <Label className="text-sm font-medium">Visibility</Label>
                <p className="text-xs text-slate-500">
                  {isPrivate
                    ? "Only you can view and use this package"
                    : "Anyone can view and use your package"}
                </p>
              </div>
              <Select
                value={isPrivate ? "private" : "public"}
                onValueChange={(value) => setIsPrivate(value === "private")}
              >
                <SelectTrigger className="w-full sm:w-32 sm:mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="!z-[999]">
                  <SelectItem value="public" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>Private</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({
                name: packageName.trim(),
                isPrivate,
                orgId: selectedOrgId,
              })
              onOpenChange(false)
            }}
            disabled={!selectedOrgId || orgsLoading}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useNewPackageSavePromptDialog = createUseDialog(
  NewPackageSavePromptDialog,
)
