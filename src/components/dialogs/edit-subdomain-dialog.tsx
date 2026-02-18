import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useMemo, useState, useEffect } from "react"
import { createUseDialog } from "./create-use-dialog"
import { useUpdatePackageDomain } from "@/hooks/use-package-domains"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"
import type {
  PublicPackageDomain,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"
import { cn } from "@/lib/utils"

const DOMAIN_SUFFIX = ".tscircuit.app"

type PointsToTarget = "package" | "package_release"

function extractSubdomain(fqdn: string): string {
  if (fqdn.endsWith(DOMAIN_SUFFIX)) {
    return fqdn.slice(0, -DOMAIN_SUFFIX.length)
  }
  return fqdn
}

function getInitialPointsTo(domain: PublicPackageDomain): PointsToTarget {
  return domain.points_to === "package_release" ? "package_release" : "package"
}

function releaseLabel(release: PublicPackageRelease): string {
  return release.version || release.package_release_id
}

export const EditSubdomainDialog = ({
  open,
  onOpenChange,
  packageDomain,
  targetInfo,
  releases,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageDomain: PublicPackageDomain
  targetInfo?: { badgeLabel: string; description: string } | null
  releases: PublicPackageRelease[]
}) => {
  const [subdomain, setSubdomain] = useState(
    extractSubdomain(packageDomain.fully_qualified_domain_name || ""),
  )
  const [pointsTo, setPointsTo] = useState<PointsToTarget>(
    getInitialPointsTo(packageDomain),
  )
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>(
    packageDomain.package_release_id || "",
  )
  const [releasePickerOpen, setReleasePickerOpen] = useState(false)

  const updateMutation = useUpdatePackageDomain()

  useEffect(() => {
    if (open) {
      setSubdomain(
        extractSubdomain(packageDomain.fully_qualified_domain_name || ""),
      )
      setPointsTo(getInitialPointsTo(packageDomain))
      setSelectedReleaseId(packageDomain.package_release_id || "")
      setReleasePickerOpen(false)
    }
  }, [open, packageDomain])

  const normalizedSubdomain = subdomain
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")

  const newFqdn = normalizedSubdomain
    ? `${normalizedSubdomain}${DOMAIN_SUFFIX}`
    : ""

  const selectedRelease = useMemo(
    () =>
      releases.find(
        (release) => release.package_release_id === selectedReleaseId,
      ),
    [releases, selectedReleaseId],
  )

  const isValidSubdomain = normalizedSubdomain.length > 0
  const isValidTarget = pointsTo === "package" || Boolean(selectedReleaseId)

  const hasChanged =
    newFqdn !== (packageDomain.fully_qualified_domain_name || "") ||
    pointsTo !== getInitialPointsTo(packageDomain) ||
    (pointsTo === "package_release" &&
      selectedReleaseId !== (packageDomain.package_release_id || ""))

  const handleSave = () => {
    if (!isValidSubdomain || !isValidTarget || !hasChanged) return

    const payload: Parameters<typeof updateMutation.mutate>[0] = {
      package_domain_id: packageDomain.package_domain_id,
      fully_qualified_domain_name: newFqdn,
      points_to: pointsTo,
      package_id:
        pointsTo === "package" ? packageDomain.package_id || null : null,
      package_release_id:
        pointsTo === "package_release" ? selectedReleaseId : null,
      package_build_id: null,
      tag: null,
    }

    updateMutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subdomain</DialogTitle>
          <DialogDescription>
            Update the subdomain and where this domain points. You can target
            the package latest release or a specific release version.
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
                    isValidSubdomain &&
                    isValidTarget &&
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
            {subdomain.trim() && normalizedSubdomain !== subdomain.trim() && (
              <p className="text-xs text-gray-500">
                Will be normalized to: {normalizedSubdomain}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Points to</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={pointsTo === "package" ? "default" : "outline"}
                size="sm"
                onClick={() => setPointsTo("package")}
                disabled={updateMutation.isLoading}
              >
                Latest release
              </Button>
              <Button
                type="button"
                variant={pointsTo === "package_release" ? "default" : "outline"}
                size="sm"
                onClick={() => setPointsTo("package_release")}
                disabled={updateMutation.isLoading}
              >
                Specific release
              </Button>
            </div>
          </div>

          {pointsTo === "package_release" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">
                Release version
              </p>
              <Popover
                open={releasePickerOpen}
                onOpenChange={setReleasePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={releasePickerOpen}
                    className="w-full justify-between"
                    disabled={updateMutation.isLoading}
                  >
                    {selectedRelease
                      ? releaseLabel(selectedRelease)
                      : "Select a release..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command>
                    <CommandInput placeholder="Search releases..." />
                    <CommandList>
                      <CommandEmpty>No releases found.</CommandEmpty>
                      <CommandGroup>
                        {releases.map((release) => (
                          <CommandItem
                            key={release.package_release_id}
                            value={`${release.version || ""} ${release.package_release_id}`}
                            onSelect={() => {
                              setSelectedReleaseId(release.package_release_id)
                              setReleasePickerOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedReleaseId === release.package_release_id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {releaseLabel(release)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {!isValidTarget && (
                <p className="text-xs text-red-500">
                  Please select a release version.
                </p>
              )}
            </div>
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
              disabled={
                !isValidSubdomain ||
                !isValidTarget ||
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
