import { useState, useEffect, useCallback } from "react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GithubAvatarWithFallback } from "@/components/GithubAvatarWithFallback"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUploadOrgAvatarMutation } from "@/hooks/use-upload-org-avatar-mutation"

interface UseAvatarUploadDialogProps {
  orgId: string | null | undefined
  currentAvatarUrl?: string | null
  fallbackUsername?: string | null
  fallbackText?: string | null
  title?: string
  description?: string
  onSuccess?: () => void
}

export const useAvatarUploadDialog = ({
  orgId,
  currentAvatarUrl,
  fallbackUsername,
  fallbackText,
  title = "Update avatar",
  description = "Upload a square image (PNG, JPG, or GIF) up to 5MB.",
  onSuccess,
}: UseAvatarUploadDialogProps) => {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setSelectedFile(null)
    setPreview(null)
    setError(null)
  }, [preview])

  const uploadMutation = useUploadOrgAvatarMutation({
    onSuccess: () => {
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      })
      reset()
      setIsOpen(false)
      onSuccess?.()
    },
    onError: (err: any) => {
      const errorMessage =
        err?.data?.error?.message ||
        err?.response?.data?.error?.message ||
        "Failed to upload avatar"
      setError(errorMessage)
      toast({
        title: "Failed to upload avatar",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.")
      setSelectedFile(null)
      setPreview(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar must be 5MB or smaller.")
      setSelectedFile(null)
      setPreview(null)
      return
    }

    if (preview) {
      URL.revokeObjectURL(preview)
    }

    setError(null)
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleUpload = () => {
    if (!orgId || !selectedFile) {
      if (!selectedFile) setError("Please select an image to upload.")
      return
    }
    uploadMutation.mutate({ orgId, avatarFile: selectedFile })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) reset()
    setIsOpen(open)
  }

  const openDialog = () => setIsOpen(true)

  const AvatarUploadDialog = () => (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center flex-col gap-4">
            <GithubAvatarWithFallback
              username={fallbackUsername ?? undefined}
              fallback={fallbackText ?? undefined}
              imageUrl={preview || currentAvatarUrl || undefined}
              className="shadow-sm size-20 md:size-24"
              fallbackClassName="font-semibold text-lg"
              colorClassName="text-black"
            />
            <div className="text-sm text-gray-600 text-center">
              {selectedFile ? (
                <>
                  <p className="font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <p>Choose an image file to preview and upload.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploadMutation.isLoading}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-gray-500">
              Supported formats: PNG, JPG, GIF. Max size 5MB.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploadMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isLoading}
          >
            {uploadMutation.isLoading && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Save avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return {
    AvatarUploadDialog,
    openDialog,
    isUploading: uploadMutation.isLoading,
    preview,
  }
}
