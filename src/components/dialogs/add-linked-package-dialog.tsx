import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useAddOrgDomainLinkedPackage } from "@/hooks/use-org-domains"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { SearchableSelect } from "../ui/searchable-select"
import { Loader2 } from "lucide-react"
import type { Package } from "fake-snippets-api/lib/db/schema"

export const AddLinkedPackageDialog = ({
  open,
  onOpenChange,
  orgDomainId,
  orgId,
  existingReleaseIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgDomainId: string
  orgId: string
  existingReleaseIds: string[]
}) => {
  const [selectedPackageId, setSelectedPackageId] = useState("")
  const [selectedReleaseId, setSelectedReleaseId] = useState("")
  const axios = useAxios()
  const addMutation = useAddOrgDomainLinkedPackage()

  useEffect(() => {
    if (open) {
      setSelectedPackageId("")
      setSelectedReleaseId("")
    }
  }, [open])

  const { data: packages = [] } = useQuery<Package[]>(
    ["orgPackages", orgId],
    async () => {
      const { data } = await axios.post("/packages/list", {
        owner_org_id: orgId,
      })
      return data.packages || []
    },
    {
      enabled: Boolean(orgId) && open,
      retry: false,
      refetchOnWindowFocus: false,
    },
  )

  const { data: releases = [] } = usePackageReleasesByPackageId(
    selectedPackageId || null,
  )

  const packageOptions = packages.map((p) => ({
    value: p.package_id,
    label: p.unscoped_name || p.name || p.package_id,
  }))

  const releaseOptions = releases
    .filter((r) => !existingReleaseIds.includes(r.package_release_id))
    .map((r) => ({
      value: r.package_release_id,
      label: r.version
        ? r.version.startsWith("v")
          ? r.version
          : `v${r.version}`
        : r.package_release_id,
    }))

  const handleAdd = () => {
    if (!selectedReleaseId) return
    addMutation.mutate(
      {
        org_domain_id: orgDomainId,
        points_to: "package_release",
        package_release_id: selectedReleaseId,
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
          <DialogTitle>Add Linked Package</DialogTitle>
          <DialogDescription>
            Select a package and release to include in this domain's merged PCM
            repository.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Package</label>
            <SearchableSelect
              value={selectedPackageId}
              onChange={(v) => {
                setSelectedPackageId(v)
                setSelectedReleaseId("")
              }}
              options={packageOptions}
            />
          </div>
          {selectedPackageId && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">
                Release
              </label>
              {releases.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No releases found for this package.
                </p>
              ) : releaseOptions.length === 0 ? (
                <p className="text-xs text-gray-500">
                  All releases are already linked.
                </p>
              ) : (
                <SearchableSelect
                  value={selectedReleaseId}
                  onChange={setSelectedReleaseId}
                  options={releaseOptions}
                />
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={addMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!selectedReleaseId || addMutation.isLoading}
            >
              {addMutation.isLoading && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
