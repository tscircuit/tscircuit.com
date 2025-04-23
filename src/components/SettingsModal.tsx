import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "react-query"

interface PackageInfo {
  is_private: boolean
  package_id: string
}

interface SettingsModalProps {
  packageInfo?: PackageInfo
}

export default function SettingsModal({ packageInfo }: SettingsModalProps) {
  const axios = useAxios()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Control dialog open state
  const [open, setOpen] = useState(false)
  const [visibility, setVisibility] = useState(
    packageInfo?.is_private ? "private" : "public",
  )
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (packageInfo) {
      setVisibility(packageInfo.is_private ? "private" : "public")
    }
  }, [packageInfo])

  const handleChangeVisibility = async () => {
    if (!packageInfo) return

    try {
      setSaving(true)
      const newPrivacy = visibility === "private" ? false : true
      const response = await axios.post("/snippets/update", {
        snippet_id: packageInfo.package_id,
        is_private: newPrivacy,
      })

      if (response.status === 200) {
        const updatedVisibility = newPrivacy ? "private" : "public"
        setVisibility(updatedVisibility)
        toast({
          title: "Visibility updated",
          description: `Package is now ${updatedVisibility}.`,
        })
        await queryClient.invalidateQueries([
          "snippets",
          packageInfo.package_id,
        ])
        setOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Failed to Update Visibility",
        description: error.message,
        variant: "destructive",
      })
      console.error("Failed to update visibility:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!packageInfo) return
    if (
      !confirm(
        "Are you sure you want to delete this package? This action cannot be undone.",
      )
    ) {
      return
    }

    try {
      setDeleteLoading(true)
      const response = await axios.post("/packages/delete", {
        package_id: packageInfo.package_id,
      })

      if (response.status === 200) {
        toast({
          title: "Package deleted",
          description: "Your package was successfully deleted.",
          variant: "destructive",
        })
        await queryClient.invalidateQueries(["packages"])
        setOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Failed to delete package",
        description: error.message,
        variant: "destructive",
      })
      console.error("Failed to delete package:", error)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!packageInfo) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" disabled={saving || deleteLoading}>
          <Settings className="h-4 w-4" />
          <span className="mx-2">Settings</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Package Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="border border-gray-500/20 rounded-md p-4 flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">Change package visibility</p>
              <p className="text-sm text-muted-foreground mt-1">
                This package is currently <strong>{visibility}</strong>.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleChangeVisibility}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : visibility === "private"
                  ? "Make Public"
                  : "Make Private"}
            </Button>
          </div>

          <div className="border border-red-500/20 rounded-md p-4 flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm text-red-600">
                Delete this package
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Once you delete a package, there is no going back
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
              size="sm"
            >
              {deleteLoading ? "Deleting..." : "Delete package"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
