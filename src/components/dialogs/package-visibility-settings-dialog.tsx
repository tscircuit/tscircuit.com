import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { createUseDialog } from "./create-use-dialog"

export const PackageVisibilitySettingsDialog = ({
  open,
  onOpenChange,
  initialIsPrivate = false,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIsPrivate?: boolean
  onSave: (isPrivate: boolean) => void
}) => {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Snippet Privacy Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={isPrivate ? "private" : "public"}
            onValueChange={(value) => setIsPrivate(value === "private")}
            className="space-y-4"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="public" id="public" />
              <div className="grid gap-1.5">
                <Label htmlFor="public" className="font-medium">
                  Public
                </Label>
                <p className="text-sm text-slate-500">
                  Anyone can view and use your snippet. It will appear in search
                  results.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="private" id="private" />
              <div className="grid gap-1.5">
                <Label htmlFor="private" className="font-medium">
                  Private
                </Label>
                <p className="text-sm text-slate-500">
                  Only you can view and use this snippet. It won't appear in
                  search results.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(isPrivate)
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const usePackageVisibilitySettingsDialog = createUseDialog(
  PackageVisibilitySettingsDialog,
)
