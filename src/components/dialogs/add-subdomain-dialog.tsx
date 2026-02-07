import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"
import { useCreatePackageDomain } from "@/hooks/use-package-domains"
import { Loader2 } from "lucide-react"

const DOMAIN_SUFFIX = ".tscircuit.app"

export const AddSubdomainDialog = ({
  open,
  onOpenChange,
  packageReleaseId,
  packageId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageReleaseId?: string | null
  packageId?: string | null
}) => {
  const [subdomain, setSubdomain] = useState("")
  const createMutation = useCreatePackageDomain()

  useEffect(() => {
    if (open) {
      setSubdomain("")
    }
  }, [open])

  const normalizedSubdomain = subdomain
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")

  const newFqdn = normalizedSubdomain
    ? `${normalizedSubdomain}${DOMAIN_SUFFIX}`
    : ""

  const isValid = normalizedSubdomain.length > 0

  const handleCreate = () => {
    if (!isValid) return

    const params: Parameters<typeof createMutation.mutate>[0] = packageReleaseId
      ? {
          points_to: "package_release" as const,
          package_release_id: packageReleaseId,
          fully_qualified_domain_name: newFqdn,
        }
      : {
          points_to: "package" as const,
          package_id: packageId!,
          fully_qualified_domain_name: newFqdn,
        }

    createMutation.mutate(params, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Subdomain</DialogTitle>
          <DialogDescription>
            Create a new subdomain for this package. Only lowercase letters,
            numbers, and hyphens are allowed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-0">
            <Input
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="my-board"
              className="rounded-r-none text-sm"
              autoComplete="off"
              disabled={createMutation.isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) {
                  handleCreate()
                }
              }}
            />
            <span className="text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-200 rounded-r-md px-3 py-2 whitespace-nowrap">
              {DOMAIN_SUFFIX}
            </span>
          </div>
          {subdomain.trim() && normalizedSubdomain !== subdomain.trim() && (
            <p className="text-xs text-gray-500">
              Will be normalized to: {normalizedSubdomain}
            </p>
          )}
          {newFqdn && (
            <p className="text-xs text-gray-500">
              Domain: <span className="font-medium">{newFqdn}</span>
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!isValid || createMutation.isLoading}
            >
              {createMutation.isLoading && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
