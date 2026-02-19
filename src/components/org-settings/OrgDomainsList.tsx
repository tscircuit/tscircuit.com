import { useMemo, useState } from "react"
import { useQuery } from "react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  useOrgDomains,
  useRemoveOrgDomainLinkedPackage,
  useUpdateOrgDomain,
} from "@/hooks/use-org-domains"
import { useAxios } from "@/hooks/use-axios"
import { AddOrgSubdomainDialog } from "@/components/dialogs/add-org-subdomain-dialog"
import { AddLinkedPackageDialog } from "@/components/dialogs/add-linked-package-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  Package,
  Pencil,
} from "lucide-react"
import type {
  PublicOrgDomain,
  Package as PackageType,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"

type OrgDomainLinkedPackageCompat = Omit<
  PublicOrgDomain["linked_packages"][number],
  "points_to"
> & {
  points_to?: "package_release" | "package_release_with_tag" | string | null
  tag?: string | null
  package_id?: string | null
}

export function OrgDomainsList({ orgId }: { orgId: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false)
  const [addLinkedPackageDomainId, setAddLinkedPackageDomainId] = useState<
    string | null
  >(null)
  const [editDomain, setEditDomain] = useState<PublicOrgDomain | null>(null)
  const [pcmRepositoryName, setPcmRepositoryName] = useState("")

  const axios = useAxios()
  const { data: domains = [], isLoading } = useOrgDomains(orgId)
  const removeMutation = useRemoveOrgDomainLinkedPackage()
  const updateDomainMutation = useUpdateOrgDomain()

  const { data: orgPackages = [] } = useQuery<PackageType[]>(
    ["orgPackages", orgId],
    async () => {
      const { data } = await axios.post("/packages/list", {
        owner_org_id: orgId,
      })
      return data.packages || []
    },
    {
      enabled: Boolean(orgId),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )

  const packageIds = useMemo(
    () => orgPackages.map((p) => p.package_id),
    [orgPackages],
  )

  const packageNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const pkg of orgPackages) {
      map.set(pkg.package_id, pkg.unscoped_name || pkg.name || pkg.package_id)
    }
    return map
  }, [orgPackages])

  const { data: allReleases = [] } = useQuery<PublicPackageRelease[]>(
    ["orgPackageReleases", orgId, packageIds],
    async () => {
      if (packageIds.length === 0) return []
      const results = await Promise.all(
        packageIds.map((package_id) =>
          axios.post<{ package_releases: PublicPackageRelease[] }>(
            "/package_releases/list",
            { package_id },
          ),
        ),
      )
      return results.flatMap((r) => r.data.package_releases || [])
    },
    {
      enabled: packageIds.length > 0,
      retry: false,
      refetchOnWindowFocus: false,
    },
  )

  const releaseInfoById = useMemo(() => {
    const map = new Map<
      string,
      { packageName: string; version: string | null }
    >()
    for (const release of allReleases) {
      const pkg = orgPackages.find((p) => p.package_id === release.package_id)
      map.set(release.package_release_id, {
        packageName: pkg?.unscoped_name || pkg?.name || "Unknown package",
        version: release.version || null,
      })
    }
    return map
  }, [allReleases, orgPackages])

  const filteredDomains = domains.filter((d) =>
    (d.fully_qualified_domain_name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  )

  const activeDomain = addLinkedPackageDomainId
    ? domains.find((d) => d.org_domain_id === addLinkedPackageDomainId)
    : null

  const existingReleaseIds = activeDomain
    ? (activeDomain.linked_packages
        .map((lp) => lp.package_release_id)
        .filter(Boolean) as string[])
    : []

  const existingLatestPackageIds = activeDomain
    ? (activeDomain.linked_packages
        .map((lp) => lp as OrgDomainLinkedPackageCompat)
        .filter(
          (lp) =>
            lp.points_to === "package_release_with_tag" && lp.tag === "latest",
        )
        .map((lp) => lp.package_id)
        .filter(Boolean) as string[])
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Domains</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage domains that serve merged PCM repositories for this
            organization.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => setShowAddDomainDialog(true)}
          >
            Add new subdomain
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search domains"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0 placeholder:text-gray-400 focus:shadow-none shadow-none focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-gray-400" />
              Loading domains...
            </div>
          ) : filteredDomains.length > 0 ? (
            filteredDomains.map((domain) => (
              <OrgDomainCard
                key={domain.org_domain_id}
                domain={domain}
                releaseInfoById={releaseInfoById}
                packageNameById={packageNameById}
                onAddPackage={() =>
                  setAddLinkedPackageDomainId(domain.org_domain_id)
                }
                onEditDomain={() => {
                  setEditDomain(domain)
                  setPcmRepositoryName(domain.pcm_repository_name ?? "")
                }}
                onRemoveLinkedPackage={(linkedPackageId) =>
                  removeMutation.mutate({
                    org_domain_id: domain.org_domain_id,
                    org_domain_linked_package_id: linkedPackageId,
                  })
                }
                isRemoving={removeMutation.isLoading}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              {searchQuery
                ? "No domains match your search"
                : "No domains configured yet"}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(editDomain)}
        onOpenChange={(open) => {
          if (!open && !updateDomainMutation.isLoading) {
            setEditDomain(null)
          }
        }}
      >
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>
              Configure how this merged PCM repository appears in the KiCad PCM
              dropdown.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Domain</p>
              <p className="text-sm text-gray-600">
                {editDomain?.fully_qualified_domain_name}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">
                PCM Repository Name
              </p>
              <Input
                value={pcmRepositoryName}
                onChange={(e) => setPcmRepositoryName(e.target.value)}
                placeholder="Acme Components"
                disabled={updateDomainMutation.isLoading}
              />
              <p className="text-xs text-gray-500">
                This is how the PCM repository will appear in the KiCad PCM
                dropdown.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDomain(null)}
                disabled={updateDomainMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!editDomain || updateDomainMutation.isLoading}
                onClick={() => {
                  if (!editDomain) return
                  updateDomainMutation.mutate(
                    {
                      org_domain_id: editDomain.org_domain_id,
                      pcm_repository_name: pcmRepositoryName.trim() || null,
                    },
                    {
                      onSuccess: () => setEditDomain(null),
                    },
                  )
                }}
              >
                {updateDomainMutation.isLoading && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddOrgSubdomainDialog
        open={showAddDomainDialog}
        onOpenChange={setShowAddDomainDialog}
        orgId={orgId}
      />

      {addLinkedPackageDomainId && (
        <AddLinkedPackageDialog
          open={!!addLinkedPackageDomainId}
          onOpenChange={(open) => {
            if (!open) setAddLinkedPackageDomainId(null)
          }}
          orgDomainId={addLinkedPackageDomainId}
          orgId={orgId}
          existingReleaseIds={existingReleaseIds}
          existingLatestPackageIds={existingLatestPackageIds}
        />
      )}
    </div>
  )
}

function OrgDomainCard({
  domain,
  releaseInfoById,
  packageNameById,
  onAddPackage,
  onEditDomain,
  onRemoveLinkedPackage,
  isRemoving,
}: {
  domain: PublicOrgDomain
  releaseInfoById: Map<string, { packageName: string; version: string | null }>
  packageNameById: Map<string, string>
  onAddPackage: () => void
  onEditDomain: () => void
  onRemoveLinkedPackage: (linkedPackageId: string) => void
  isRemoving: boolean
}) {
  return (
    <div className="group p-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <CheckCircle2 className="h-5 w-5 text-white fill-blue-500 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {domain.fully_qualified_domain_name}
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] uppercase tracking-wide shrink-0"
              >
                Merged PCM Repository
              </Badge>
              <a
                href={`https://${domain.fully_qualified_domain_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="lg:opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100 shrink-0"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </a>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Created {new Date(domain.created_at).toLocaleDateString()}
            </p>
            {domain.pcm_repository_name && (
              <p className="mt-1 text-xs text-gray-500">
                PCM repository name: {domain.pcm_repository_name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 bg-white shrink-0"
            onClick={onEditDomain}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 bg-white shrink-0"
            onClick={onAddPackage}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add package
          </Button>
        </div>
      </div>

      {domain.linked_packages.length > 0 && (
        <div className="mt-3 ml-8 border-t border-gray-100 pt-3 space-y-2">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Linked packages ({domain.linked_packages.length})
          </p>
          {domain.linked_packages.map((lp) => {
            const linkedPackage = lp as OrgDomainLinkedPackageCompat
            const info = lp.package_release_id
              ? releaseInfoById.get(lp.package_release_id)
              : null
            const latestLabel =
              linkedPackage.points_to === "package_release_with_tag" &&
              linkedPackage.tag === "latest" &&
              linkedPackage.package_id
                ? `${packageNameById.get(linkedPackage.package_id) || linkedPackage.package_id} (Latest Version)`
                : null

            const label = latestLabel
              ? latestLabel
              : info
                ? `${info.packageName}${info.version ? ` ${info.version.startsWith("v") ? info.version : `v${info.version}`}` : ""}`
                : lp.package_release_id || "Unknown"

            return (
              <div
                key={lp.org_domain_linked_package_id}
                className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 text-sm text-gray-700">
                  <Package className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  onClick={() =>
                    onRemoveLinkedPackage(lp.org_domain_linked_package_id)
                  }
                  disabled={isRemoving}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
