import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
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
  existingLatestPackageIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgDomainId: string
  orgId: string
  existingReleaseIds: string[]
  existingLatestPackageIds: string[]
}) => {
  const [selectedPackageId, setSelectedPackageId] = useState("")
  const [selectedReleaseId, setSelectedReleaseId] = useState("")
  const [useLatestVersion, setUseLatestVersion] = useState(true)
  const axios = useAxios()
  const addMutation = useAddOrgDomainLinkedPackage()

  useEffect(() => {
    if (open) {
      setSelectedPackageId("")
      setSelectedReleaseId("")
      setUseLatestVersion(true)
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

  const latestRelease = releases.find((r) => r.is_latest) ?? releases[0]

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

  const packageAlreadyLinkedToLatest =
    existingLatestPackageIds.includes(selectedPackageId)

  const latestReleaseLabel = latestRelease?.version
    ? latestRelease.version.startsWith("v")
      ? latestRelease.version
      : `v${latestRelease.version}`
    : "latest"

  const handleAdd = () => {
    if (useLatestVersion && !selectedPackageId) return
    if (!useLatestVersion && !selectedReleaseId) return

    addMutation.mutate(
      useLatestVersion
        ? {
            org_domain_id: orgDomainId,
            points_to: "package_release_with_tag",
            package_id: selectedPackageId,
            tag: "latest",
          }
        : {
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
            Select a package and release to include in this domain&apos;s merged
            PCM repository.
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
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useLatestVersion"
                  checked={useLatestVersion}
                  onCheckedChange={(checked) => {
                    const nextUseLatest = Boolean(checked)
                    setUseLatestVersion(nextUseLatest)
                    if (nextUseLatest) {
                      setSelectedReleaseId("")
                    }
                  }}
                />
                <label
                  htmlFor="useLatestVersion"
                  className="text-xs font-medium text-gray-700"
                >
                  Use Latest Version
                </label>
              </div>

              {!useLatestVersion && (
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

              {useLatestVersion && (
                <p className="text-xs text-gray-500">
                  {packageAlreadyLinkedToLatest
                    ? "This package is already linked with Latest Version."
                    : `Will track the latest release${latestRelease ? ` (currently ${latestReleaseLabel})` : ""}.`}
                </p>
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
              disabled={
                !selectedPackageId ||
                (!useLatestVersion && !selectedReleaseId) ||
                (useLatestVersion && packageAlreadyLinkedToLatest) ||
                addMutation.isLoading
              }
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
