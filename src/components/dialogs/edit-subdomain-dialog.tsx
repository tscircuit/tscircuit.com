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
import { createUseDialog } from "./create-use-dialog"
import { useUpdatePackageDomain } from "@/hooks/use-package-domains"
import { Loader2 } from "lucide-react"

const DOMAIN_SUFFIX = ".tscircuit.app"

function extractSubdomain(fqdn: string): string {
  if (fqdn.endsWith(DOMAIN_SUFFIX)) {
    return fqdn.slice(0, -DOMAIN_SUFFIX.length)
  }
  return fqdn
}

export const EditSubdomainDialog = ({
  open,
  onOpenChange,
  packageDomainId,
  currentFqdn,
  targetInfo,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageDomainId: string
  currentFqdn: string
  targetInfo?: { badgeLabel: string; description: string } | null
}) => {
  const [subdomain, setSubdomain] = useState(extractSubdomain(currentFqdn))
  const updateMutation = useUpdatePackageDomain()

  useEffect(() => {
    if (open) {
      setSubdomain(extractSubdomain(currentFqdn))
    }
  }, [open, currentFqdn])

  const normalizedSubdomain = subdomain
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")

  const newFqdn = normalizedSubdomain
    ? `${normalizedSubdomain}${DOMAIN_SUFFIX}`
    : ""

  const hasChanged = newFqdn !== currentFqdn
  const isValid = normalizedSubdomain.length > 0

  const handleSave = () => {
    if (!isValid || !hasChanged) return
    updateMutation.mutate(
      {
        package_domain_id: packageDomainId,
        fully_qualified_domain_name: newFqdn,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subdomain</DialogTitle>
          <DialogDescription>
            Change the subdomain for this domain. Only lowercase letters,
            numbers, and hyphens are allowed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {targetInfo && (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-xs font-medium text-gray-700">
                {targetInfo.badgeLabel}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {targetInfo.description}
              </p>
            </div>
          )}
          <div className="flex items-center gap-0">
            <Input
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="my-board"
              className="rounded-r-none text-sm"
              autoComplete="off"
              disabled={updateMutation.isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid && hasChanged) {
                  handleSave()
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
          {newFqdn && hasChanged && (
            <p className="text-xs text-gray-500">
              New domain: <span className="font-medium">{newFqdn}</span>
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isValid || !hasChanged || updateMutation.isLoading}
            >
              {updateMutation.isLoading && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useEditSubdomainDialog = createUseDialog(EditSubdomainDialog)
