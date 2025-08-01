import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Tag, AlertCircle } from "lucide-react"

interface CreateReleaseDialogProps {
  isOpen: boolean
  onClose: () => void
  version: string
  setVersion: (version: string) => void
  currentVersion?: string
  isLoading: boolean
  error: string | null
  onCreateRelease: () => Promise<void>
}

export function CreateReleaseDialog({
  isOpen,
  onClose,
  version,
  setVersion,
  currentVersion,
  isLoading,
  error,
  onCreateRelease,
}: CreateReleaseDialogProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onCreateRelease()
  }

  const handleClose = () => {
    onClose()
  }
  const suggestNextVersion = () => {
    if (!currentVersion) return "0.0.1"

    const parts = currentVersion.split(".")
    console.log(parts)

    if (parts.length === 3) {
      const [major, minor, patch] = parts.map(Number)
      if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
        return null
      }
      return `${major}.${minor}.${patch + 1}`
    }
    return null
  }

  const handleSuggestedVersion = () => {
    const suggestedVersion = suggestNextVersion()
    if (suggestedVersion) {
      setVersion(suggestedVersion)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Create New Release
          </DialogTitle>
          <DialogDescription>
            Create a new release. This will make your latest changes available
            to users.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-center">
              <p className="text-sm text-muted-foreground text-center">
                {currentVersion ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>Current version:</span>
                    <span className="font-mono font-medium text-foreground bg-muted px-2 py-1 rounded-md text-xs border">
                      {currentVersion}
                    </span>
                  </span>
                ) : (
                  "Follow semantic versioning (e.g., 1.0.0)"
                )}
              </p>
            </div>{" "}
            <Label htmlFor="version" className="text-sm font-medium">
              Version
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="version"
                placeholder="e.g., 1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={isLoading}
                className="flex-1 h-10"
              />
              {currentVersion && suggestNextVersion() && (
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={handleSuggestedVersion}
                  disabled={isLoading}
                  className="whitespace-nowrap h-10 px-3 font-normal"
                >
                  Suggest: {suggestNextVersion()}
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !version.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Release"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
