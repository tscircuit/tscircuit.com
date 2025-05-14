import React from "react"
import { Package } from "fake-snippets-api/lib/db/schema"
import { PackageCardSkeleton } from "./PackageCardSkeleton"
import { Search } from "lucide-react"
import { PackageCard } from "./PackageCard"

const PackageGrid = ({
  packages,
  baseUrl,
}: { packages: Package[]; baseUrl: string }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {packages.map((pkg) => (
      <PackageCard
        key={pkg.package_id}
        pkg={pkg}
        baseUrl={baseUrl}
        showOwner={true}
      />
    ))}
  </div>
)

const LoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <PackageCardSkeleton key={i} />
    ))}
  </div>
)

const ErrorState = () => (
  <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm max-w-2xl mx-auto">
    <div className="flex items-start">
      <div className="mr-4 bg-red-100 p-2 rounded-full">
        <Search className="w-6 h-6 text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Error Loading packages</h3>
        <p className="text-red-600">
          We couldn't load the trending packages. Please try again later.
        </p>
      </div>
    </div>
  </div>
)

const EmptyState = ({
  searchQuery,
  category,
}: { searchQuery: string; category: string }) => (
  <div className="text-center py-12 px-4">
    <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
      <Search className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-xl font-medium text-slate-900 mb-2">
      No Matching Packages
    </h3>
    <p className="text-slate-500 max-w-md mx-auto mb-6">
      {searchQuery
        ? `No packages match your search for "${searchQuery}".`
        : category !== "all"
          ? `No ${category} packages found in the trending list.`
          : "There are no trending packages at the moment."}
    </p>
  </div>
)

interface PackageSearchResultsProps {
  isLoading: boolean
  error: unknown
  filteredPackages: Package[] | undefined
  searchQuery: string
  category: string
  apiBaseUrl: string
}

const PackageSearchResults: React.FC<PackageSearchResultsProps> = ({
  isLoading,
  error,
  filteredPackages,
  searchQuery,
  category,
  apiBaseUrl,
}) => {
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState />
  if (!filteredPackages?.length)
    return <EmptyState searchQuery={searchQuery} category={category} />
  return <PackageGrid packages={filteredPackages} baseUrl={apiBaseUrl} />
}

export default PackageSearchResults
