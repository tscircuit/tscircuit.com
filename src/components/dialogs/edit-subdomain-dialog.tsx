import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState, useEffect, useMemo } from "react"
import { createUseDialog } from "./create-use-dialog"
import { useUpdatePackageDomain } from "@/hooks/use-package-domains"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Loader2 } from "lucide-react"

const DOMAIN_SUFFIX = ".tscircuit.app"

function extractSubdomain(fqdn: string): string {
  if (fqdn.endsWith(DOMAIN_SUFFIX)) {
    return fqdn.slice(0, -DOMAIN_SUFFIX.length)
  }
  return fqdn
}

function toVersionLabel(version: string | null | undefined) {
  if (!version) return "Unknown version"
  return version.startsWith("v") ? version : `v${version}`
}

export const EditSubdomainDialog = ({
  open,
  onOpenChange,
  packageDomainId,
  currentFqdn,
  targetInfo,
  packageId,
  currentPointsTo,
  currentPackageReleaseId,
  currentTag,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageDomainId: string
  currentFqdn: string
  targetInfo?: { badgeLabel: string; description: string } | null
  packageId?: string | null
  currentPointsTo?:
    | "package"
    | "package_release"
    | "package_release_with_tag"
    | string
    | null
  currentPackageReleaseId?: string | null
  currentTag?: string | null
}) => {
  const [subdomain, setSubdomain] = useState(extractSubdomain(currentFqdn))
  const isCurrentlyLatest =
    currentPointsTo === "package" ||
    (currentPointsTo === "package_release_with_tag" && currentTag === "latest")
  const [targetType, setTargetType] = useState<"latest" | "release">(
    isCurrentlyLatest || currentPointsTo !== "package_release"
      ? "latest"
      : "release",
  )
  const [selectedReleaseId, setSelectedReleaseId] = useState(
    currentPackageReleaseId || "",
  )

  const updateMutation = useUpdatePackageDomain()
  const { data: releases = [] } = usePackageReleasesByPackageId(
    packageId ?? null,
  )
  const latestRelease = releases.find((r) => r.is_latest) ?? releases[0]

  useEffect(() => {
    if (open) {
      setSubdomain(extractSubdomain(currentFqdn))
      const isLatest =
        currentPointsTo === "package" ||
        (currentPointsTo === "package_release_with_tag" &&
          currentTag === "latest")
      setTargetType(
        !isLatest && currentPointsTo === "package_release"
          ? "release"
          : "latest",
      )
      setSelectedReleaseId(currentPackageReleaseId || "")
    }
  }, [open, currentFqdn, currentPointsTo, currentPackageReleaseId, currentTag])

  const releaseOptions = useMemo(
    () =>
      releases.map((release) => ({
        value: release.package_release_id,
        label: toVersionLabel(release.version),
      })),
    [releases],
  )

  const normalizedSubdomain = subdomain
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")

  const newFqdn = normalizedSubdomain
    ? `${normalizedSubdomain}${DOMAIN_SUFFIX}`
    : ""

  const domainChanged = newFqdn !== currentFqdn
  const targetChanged =
    targetType === "latest"
      ? !(
          currentPointsTo === "package_release_with_tag" &&
          currentTag === "latest"
        )
      : currentPointsTo !== "package_release" ||
        currentPackageReleaseId !== selectedReleaseId

  const hasChanged = domainChanged || targetChanged
  const isDomainValid = normalizedSubdomain.length > 0
  const isTargetValid =
    (targetType === "latest" && Boolean(latestRelease)) ||
    (targetType === "release" && Boolean(selectedReleaseId))

  const handleSave = () => {
    if (!isDomainValid || !isTargetValid || !hasChanged) return

    updateMutation.mutate(
      {
        package_domain_id: packageDomainId,
        fully_qualified_domain_name: newFqdn,
        ...(targetType === "latest"
          ? {
              points_to: "package_release_with_tag" as const,
              tag: "latest",
              package_id: packageId,
            }
          : {
              points_to: "package_release" as const,
              package_release_id: selectedReleaseId,
            }),
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
            Change the subdomain and where this domain points. Only lowercase
            letters, numbers, and hyphens are allowed.
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
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Subdomain</p>
            <div className="flex items-center gap-0">
              <Input
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="my-board"
                className="rounded-r-none text-sm"
                autoComplete="off"
                disabled={updateMutation.isLoading}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    isDomainValid &&
                    isTargetValid &&
                    hasChanged
                  ) {
                    handleSave()
                  }
                }}
              />
              <span className="text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-200 rounded-r-md px-3 py-2 whitespace-nowrap">
                {DOMAIN_SUFFIX}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Points to</p>
            <SearchableSelect
              value={targetType}
              onChange={(value) => setTargetType(value as "latest" | "release")}
              options={[
                { value: "latest", label: "Latest package release" },
                { value: "release", label: "Specific package release" },
              ]}
            />
          </div>

          {targetType === "release" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">
                Target package release
              </p>
              <SearchableSelect
                value={selectedReleaseId}
                onChange={setSelectedReleaseId}
                options={releaseOptions}
              />
            </div>
          )}

          {subdomain.trim() && normalizedSubdomain !== subdomain.trim() && (
            <p className="text-xs text-gray-500">
              Will be normalized to: {normalizedSubdomain}
            </p>
          )}
          {newFqdn && domainChanged && (
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
              disabled={
                !isDomainValid ||
                !isTargetValid ||
                !hasChanged ||
                updateMutation.isLoading
              }
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
