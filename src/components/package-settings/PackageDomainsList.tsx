import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePackageDomains } from "@/hooks/use-package-domains"
import { EditSubdomainDialog } from "@/components/dialogs/edit-subdomain-dialog"
import { AddSubdomainDialog } from "@/components/dialogs/add-subdomain-dialog"
import { Search, CheckCircle2, ExternalLink } from "lucide-react"
import type { PublicPackageDomain } from "fake-snippets-api/lib/db/schema"

export function PackageDomainsList({
  packageReleaseId,
  packageId,
}: {
  packageReleaseId?: string | null
  packageId?: string | null
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingDomain, setEditingDomain] =
    useState<PublicPackageDomain | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const { data: domains = [], isLoading } = usePackageDomains(
    packageReleaseId
      ? { package_release_id: packageReleaseId }
      : packageId
        ? { package_id: packageId }
        : null,
  )

  const filteredDomains = domains.filter((d) =>
    (d.fully_qualified_domain_name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Domains</h2>
          <p className="text-sm text-gray-500 mt-1">
            Domains can be assigned to package release preview.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => setShowAddDialog(true)}
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
              placeholder="Search any domain"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0 placeholder:text-gray-400 focus:shadow-none shadow-none focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Loading domains...
            </div>
          ) : filteredDomains.length > 0 ? (
            filteredDomains.map((domain) => (
              <div
                key={domain.package_domain_id}
                className="group p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <CheckCircle2 className="h-5 w-5 text-white fill-blue-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">
                      {domain.fully_qualified_domain_name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-8 sm:ml-0">
                  <a
                    href={`https://${domain.fully_qualified_domain_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-gray-100"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 bg-white"
                    onClick={() => setEditingDomain(domain)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
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

      {editingDomain && (
        <EditSubdomainDialog
          open={!!editingDomain}
          onOpenChange={(open) => {
            if (!open) setEditingDomain(null)
          }}
          packageDomainId={editingDomain.package_domain_id}
          currentFqdn={editingDomain.fully_qualified_domain_name || ""}
        />
      )}

      <AddSubdomainDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        packageReleaseId={packageReleaseId}
        packageId={packageId}
      />
    </div>
  )
}
