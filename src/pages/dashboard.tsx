import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Package, Snippet } from "fake-snippets-api/lib/db/schema"
import { Link } from "wouter"
import { Edit2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/hooks/use-global-store"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"
import { PackageList } from "@/components/PackagesList"
import { SnippetList } from "@/components/SnippetList"
import { Helmet } from "react-helmet-async"
import { useSignIn } from "@/hooks/use-sign-in"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { useConfirmDeletePackageDialog } from "@/components/dialogs/confirm-delete-package-dialog"
import { PackageCardSkeleton } from "@/components/PackageCardSkeleton"
import { PackageCard } from "@/components/PackageCard"

export const DashboardPage = () => {
  const axios = useAxios()

  const currentUser = useGlobalStore((s) => s.session?.github_username)
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
    error,
  } = useQuery<Package[]>(
    "userPackages",
    async () => {
      const response = await axios.post(`/packages/list`, {
        owner_github_username: currentUser,
      })
      return response.data.packages.sort(
        (a: any, b: any) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime(),
      )
    },
    {
      enabled: isLoggedIn,
    },
  )

  const { data: trendingSnippets } = useQuery<Snippet[]>(
    "trendingSnippets",
    async () => {
      const response = await axios.get("/snippets/list_trending")
      return response.data.snippets
    },
  )

  const { data: latestPackages } = useQuery<Package[]>(
    "latestPackages",
    async () => {
      const response = await axios.get("/packages/list_latest")
      return response.data.packages
    },
  )

  const baseUrl = useSnippetsBaseApiUrl()

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex md:flex-row flex-col">
          <div className="md:w-3/4 p-0 md:pr-6">
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-md p-4 mt-[40px] mb-2 sm:mb-4">
                <div className="p-4 mb-4 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                  <KeyRound className="text-blue-500" size={32} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                  You're not logged in
                </h2>

                <p className="text-gray-600 mb-6 text-center max-w-md text-sm sm:text-base">
                  Log in to access your dashboard and manage your snippets.
                </p>
                <Button onClick={() => signIn()} variant="outline">
                  Log in
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-6 mb-4">
                  <div className="flex items-center">
                    <h2 className="text-sm text-gray-600 whitespace-nowrap">
                      Edit Recent
                    </h2>
                    <div className="flex gap-2 items-center overflow-x-scroll md:overflow-hidden">
                      {myPackages &&
                        myPackages.slice(0, 3).map((pkg) => (
                          <div key={pkg.package_id}>
                            <PrefetchPageLink
                              href={`/editor?snippet_id=${pkg.package_id}`}
                              className="text-blue-600 hover:underline"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-medium"
                              >
                                {pkg.unscoped_name}
                                <Edit2 className="w-3 h-3 ml-2" />
                              </Button>
                            </PrefetchPageLink>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                {/* <CreateNewSnippetWithAiHero/> */}
                <h2 className="text-sm font-bold mb-2 text-gray-700 border-b border-gray-200">
                  Your Recent Packages
                </h2>
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
                        baseUrl={baseUrl}
                        isCurrentUserPackage={
                          pkg.owner_github_username === currentUser
                        }
                        onDeleteClick={handleDeleteClick}
                      />
                    ))}
                  </div>
                ) : (
                  !isLoading &&
                  myPackages?.length === 0 && (
                    <span className="font-medium text-sm text-gray-500">
                      No packages found
                    </span>
                  )
                )}
                {myPackages && myPackages.length > 10 && (
                  <Link
                    href={`/${currentUser}`}
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View all packages
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="md:w-1/4">
            <SnippetList
              title="Trending Packages"
              snippets={trendingSnippets}
              showAll={showAllTrending}
              onToggleShowAll={() => setShowAllTrending(!showAllTrending)}
            />
            <div className="mt-8">
              <PackageList
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
          />
        )}
      </div>
      <Footer />
    </div>
  )
}
