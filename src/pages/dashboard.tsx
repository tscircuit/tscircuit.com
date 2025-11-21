import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Package } from "fake-snippets-api/lib/db/schema"
import { Edit2, KeyRound, Package2, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Link } from "wouter"
import { PackagesList } from "@/components/PackagesList"
import { Helmet } from "react-helmet-async"
import { useSignIn } from "@/hooks/use-sign-in"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useConfirmDeletePackageDialog } from "@/components/dialogs/confirm-delete-package-dialog"
import { PackageCardSkeleton } from "@/components/PackageCardSkeleton"
import { PackageCard } from "@/components/PackageCard"
import { useListUserOrgs } from "@/hooks/use-list-user-orgs"
import { OrganizationCard } from "@/components/organization/OrganizationCard"

export const DashboardPage = () => {
  const axios = useAxios()
  const { data: organizations } = useListUserOrgs()

  const currentUser = useGlobalStore((s) => s.session)
  const isLoggedIn = Boolean(currentUser)
  const signIn = useSignIn()

  const [showAllTrending, setShowAllTrending] = useState(false)
  const [showAllLatest, setShowAllLatest] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null)
  const { Dialog: DeleteDialog, openDialog: openDeleteDialog } =
    useConfirmDeletePackageDialog()

  const {
    data: myPackages,
    isLoading,
    refetch: refetchUserPackages,
  } = useQuery<Package[]>(
    ["userPackages", currentUser],
    async () => {
      const response = await axios.post(`/packages/list`, {
        creator_account_id: currentUser?.account_id,
      })
      return response.data.packages
    },
    {
      enabled: isLoggedIn,
      select: (data: Package[]) => {
        return [...data].sort(
          (a: Package, b: Package) =>
            new Date(b.updated_at || b.created_at).getTime() -
            new Date(a.updated_at || a.created_at).getTime(),
        )
      },
    },
  )

  const { data: trendingPackages } = useQuery<Package[]>(
    "trendingPackages",
    async () => {
      const response = await axios.get("/packages/list_trending")
      return response.data.packages
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  )

  const { data: latestPackages } = useQuery<Package[]>(
    "latestPackages",
    async () => {
      const response = await axios.get("/packages/list_latest", {
        params: {
          limit: 10,
        },
      })
      return response.data.packages
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  )

  const handleDeleteClick = (e: React.MouseEvent, pkg: Package) => {
    e.preventDefault() // Prevent navigation
    setPackageToDelete(pkg)
    openDeleteDialog()
  }
  return (
    <div>
      <Helmet>
        <title>Dashboard - tscircuit</title>
      </Helmet>
      <Header />
      <div className="container mx-auto px-4 py-8 min-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="flex md:flex-row flex-col">
          <div className="md:w-3/4 p-0 md:pr-6">
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-4 mb-4 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                  <KeyRound className="text-blue-500" size={32} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                  You're not logged in
                </h2>

                <p className="text-gray-600 mb-6 text-center max-w-md text-sm sm:text-base">
                  Log in to access your dashboard and manage your packages.
                </p>
                <Button onClick={() => signIn()} variant="default">
                  Log In
                </Button>
              </div>
            ) : (
              <>
                {myPackages && myPackages.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <h2 className="hidden md:flex text-sm mb-2 md:mb-0 md:mr-2 text-gray-600 whitespace-nowrap">
                        Edit Recent
                      </h2>
                      <div className="flex gap-2 items-center overflow-x-auto no-scrollbar md:overflow-hidden">
                        {myPackages.slice(0, 3).map((pkg) => (
                          <div key={pkg.package_id}>
                            <Link
                              href={`/editor?package_id=${pkg.package_id}`}
                              className="text-blue-600 hover:underline"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-medium whitespace-nowrap"
                              >
                                {pkg.unscoped_name}
                                <Edit2 className="w-3 h-3 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  {myPackages && myPackages.length > 0 && (
                    <h2 className="text-sm font-bold mb-4 text-gray-700 border-b border-gray-200 pb-2">
                      Your Recent Packages
                    </h2>
                  )}

                  {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <PackageCardSkeleton key={i} />
                      ))}
                    </div>
                  )}

                  {myPackages && myPackages.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {myPackages.slice(0, 10).map((pkg) => (
                        <PackageCard
                          key={pkg.package_id}
                          pkg={pkg}
                          isCurrentUserPackage={
                            pkg.creator_account_id === currentUser?.account_id
                          }
                          onDeleteClick={handleDeleteClick}
                        />
                      ))}
                    </div>
                  ) : (
                    !isLoading &&
                    myPackages?.length === 0 && (
                      <div className="h-[50vh] grid place-items-center">
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                          <div className="p-4 mb-4 rounded-full bg-slate-100">
                            <Package2 className="text-black" size={32} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            No packages yet
                          </h3>
                          <p className="text-gray-600 mb-6 text-center max-w-md text-sm">
                            Create your first package to get started with
                            tscircuit. Build and share electronic circuits with
                            ease.
                          </p>
                          <div className="flex gap-3">
                            <Link href="/editor">
                              <Button className="flex items-center gap-2">
                                <Plus size={14} />
                                Create Package
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Organizations Section */}
                {organizations && organizations.length > 0 && (
                  <div className="mt-8 mb-8 md:mb-0">
                    <h2 className="text-sm font-bold mb-4 text-gray-700 border-b border-gray-200 pb-2">
                      Your Organizations
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {organizations?.slice(0, 4).map((org: any, i: number) => (
                        <OrganizationCard
                          key={i}
                          organization={org}
                          withLink={true}
                          showStats={true}
                          showMembers={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="md:w-1/4">
            <PackagesList
              title="Trending Packages"
              packages={trendingPackages}
              showAll={showAllTrending}
              onToggleShowAll={() => setShowAllTrending(!showAllTrending)}
            />
            <div className="mt-8">
              <PackagesList
                title="Latest Packages"
                packages={latestPackages}
                showAll={showAllLatest}
                onToggleShowAll={() => setShowAllLatest(!showAllLatest)}
              />
            </div>
          </div>
        </div>
        {packageToDelete && (
          <DeleteDialog
            packageId={packageToDelete.package_id}
            packageName={packageToDelete.unscoped_name}
            packageOwner={packageToDelete.owner_github_username ?? ""}
            refetchUserPackages={refetchUserPackages}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}
