import { useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import Header from "@/components/Header"
import { PackageBreadcrumb } from "@/components/PackageBreadcrumb"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle } from "lucide-react"
import { useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { ReleasesList } from "@/components/preview/ReleasesList"
import { ReleaseItemRowSkeleton } from "@/components/preview/ReleaseItemRow"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ReleasesPage() {
  const params = useParams<{ author: string; packageName: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-Status")
  const [releaseTypeFilter, setReleaseTypeFilter] = useState("all-types")

  const packageName =
    params?.author && params?.packageName
      ? `${params.author}/${params.packageName}`
      : null

  const {
    data: pkg,
    isLoading: isLoadingPackage,
    error: packageError,
  } = usePackageByName(packageName)

  const {
    data: releases,
    isLoading: isLoadingReleases,
    error: releasesError,
  } = usePackageReleasesByPackageId(pkg?.package_id ?? null)

  if (releasesError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-lg w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full mb-6">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {releasesError.message ||
                "We're experiencing technical difficulties loading the releases. Please try reloading the page."}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <ReloadIcon className="w-4 h-4 mr-2" />
              Reload Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoadingPackage) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          <div className="bg-white border-b border-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-20" />
                <span className="text-gray-300">/</span>
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-8 w-48" />
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-8 flex-1 max-w-sm" />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  <ReleaseItemRowSkeleton />
                  <ReleaseItemRowSkeleton />
                  <ReleaseItemRowSkeleton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (packageError?.status === 404 || !pkg) {
    return <NotFoundPage heading="Package Not Found" />
  }

  return (
    <>
      <Helmet>
        <title>{`${pkg.name} Releases - tscircuit`}</title>
      </Helmet>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-100 pt-8 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PackageBreadcrumb
              author={pkg.org_owner_tscircuit_handle || pkg.name.split("/")[0]}
              packageName={packageName || ""}
              unscopedName={pkg.unscoped_name}
              currentPage="releases"
            />
            <div className="mt-4">
              <h1 className="text-3xl font-semibold select-none text-gray-900 tracking-tight">
                Releases
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search releases..."
                  className="pl-9 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0">
                <Select
                  value={releaseTypeFilter}
                  onValueChange={setReleaseTypeFilter}
                >
                  <SelectTrigger className="w-[140px] bg-white focus:ring-0 select-none">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="release">Release</SelectItem>
                    <SelectItem value="pr-preview">PR Preview</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-white focus:ring-0 select-none">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-Status">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="building">Building</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ReleasesList
              pkg={pkg}
              releases={releases}
              isLoading={isLoadingReleases}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              releaseTypeFilter={releaseTypeFilter}
            />
          </div>
        </div>
      </div>
    </>
  )
}
