import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select"
import { createUseDialog } from "./create-use-dialog"
import { useListUserOrgs } from "@/hooks/use-list-user-orgs"

export const NewPackageSavePromptDialog = ({
  open,
  onOpenChange,
  initialIsPrivate = false,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIsPrivate?: boolean
  onSave: (isPrivate: boolean, orgId: string) => void
}) => {
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
            <Label className="text-sm font-medium">Visibility</Label>
            <RadioGroup
              value={isPrivate ? "private" : "public"}
              onValueChange={(value) => setIsPrivate(value === "private")}
            >
              <div
                className="flex items-start space-x-2 px-2 py-4 rounded-md hover:bg-slate-100 cursor-pointer"
                onClick={() => setIsPrivate(false)}
              >
                <RadioGroupItem value="public" id="public" />
                <div className="grid gap-1.5">
                  <Label htmlFor="public" className="font-medium">
                    Public
                  </Label>
                  <p className="text-sm text-slate-500">
                    Anyone can view and use your package. It will appear in
                    search results.
                  </p>
                </div>
              </div>
              <div
                className="flex items-start space-x-2 px-2 py-4 rounded-md hover:bg-slate-100 cursor-pointer"
                onClick={() => setIsPrivate(true)}
              >
                <RadioGroupItem value="private" id="private" />
                <div className="grid gap-1.5">
                  <Label htmlFor="private" className="font-medium">
                    Private
                  </Label>
                  <p className="text-sm text-slate-500">
                    Only you can view and use this package. It won't appear in
                    search results.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(isPrivate, selectedOrgId)
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
