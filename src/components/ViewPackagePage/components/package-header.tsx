import React, { useEffect } from "react"
import { Link } from "wouter"

import { TypeBadge } from "@/components/TypeBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LockClosedIcon } from "@radix-ui/react-icons"
import { GitFork, Package, Star } from "lucide-react"

import { useForkPackageMutation } from "@/hooks/use-fork-package-mutation"
import {
  usePackageStarMutationByName,
  usePackageStarsByName,
} from "@/hooks/use-package-stars"
import { useOrderDialog } from "@tscircuit/runframe"
import { useGlobalStore } from "@/hooks/use-global-store"
import { PackageInfo } from "@/lib/types"

interface PackageHeaderProps {
  packageInfo?: PackageInfo
  isPrivate?: boolean
  isCurrentUserAuthor?: boolean
}

export default function PackageHeader({
  packageInfo,
  isPrivate = false,
  isCurrentUserAuthor = false,
}: PackageHeaderProps) {
  const author = packageInfo?.owner_github_username
  const packageName = packageInfo?.unscoped_name
  const sessionToken = useGlobalStore((s) => s.session?.token)
  const isOwner =
    packageInfo?.owner_github_username ===
    useGlobalStore((s) => s.session?.github_username)
  const isLoggedIn = useGlobalStore((s) => s.session != null)
  const { OrderDialog, isOpen, open, close, stage, setStage } = useOrderDialog()
  const { data: starData, isLoading: isStarDataLoading } =
    usePackageStarsByName(packageInfo?.name ?? null)
  const { addStar, removeStar } = usePackageStarMutationByName(
    packageInfo?.name ?? "",
  )

  const { mutateAsync: forkPackage, isLoading: isForkLoading } =
    useForkPackageMutation()

  const handleStarClick = async () => {
    if (!packageInfo?.name || !isLoggedIn) return

    if (starData?.is_starred) {
      await removeStar.mutateAsync()
    } else {
      await addStar.mutateAsync()
    }
  }

  const handleForkClick = async () => {
    if (!packageInfo?.package_id || !isLoggedIn) return
    await forkPackage(packageInfo.package_id)
  }

  const isStarLoading =
    isStarDataLoading || addStar.isLoading || removeStar.isLoading

  useEffect(() => {
    window.TSCIRCUIT_REGISTRY_API_BASE_URL =
      import.meta.env.VITE_TSCIRCUIT_REGISTRY_API_URL ??
      `${window.location.origin}/api`
    window.TSCIRCUIT_REGISTRY_TOKEN = sessionToken ?? ""
    // TODO: replace with production stripe checkout base url
    window.TSCIRCUIT_STRIPE_CHECKOUT_BASE_URL =
      import.meta.env.VITE_TSCIRCUIT_STRIPE_CHECKOUT_BASE_URL
  }, [sessionToken])

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center min-w-0 flex-wrap">
            {author && packageName ? (
              <>
                <h1 className="text-lg md:text-xl font-bold mr-2 break-words">
                  <Link
                    href={`/${author}`}
                    className="text-blue-600 hover:underline"
                  >
                    {author}
                  </Link>
                  <span className="px-1 text-gray-500">/</span>
                  <Link
                    href={`/${author}/${packageName}`}
                    className="text-blue-600 hover:underline"
                  >
                    {packageName}
                  </Link>
                </h1>
                {packageInfo?.name && <TypeBadge type="package" />}
                {isPrivate && (
                  <div className="relative group pl-2">
                    <LockClosedIcon className="h-4 w-4 text-gray-700" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                      private
                    </span>
                  </div>
                )}
              </>
            ) : (
              <Skeleton className="h-6 w-72" />
            )}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={open}>
              <Package className="w-4 h-4 mr-2" />
              Order
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      className={
                        isForkLoading || !packageInfo?.name || !isLoggedIn
                          ? "pointer-events-none"
                          : ""
                      }
                      onClick={handleStarClick}
                      disabled={
                        isStarLoading || !packageInfo?.name || !isLoggedIn
                      }
                    >
                      <Star
                        className={`w-4 h-4 mr-2 ${
                          starData?.is_starred
                            ? "fill-yellow-500 text-yellow-500"
                            : ""
                        }`}
                      />
                      {starData?.is_starred ? "Starred" : "Star"}
                      {(starData?.star_count ?? 0) > 0 && (
                        <span className="ml-1.5 bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.5 text-xs font-medium">
                          {starData?.star_count}
                        </span>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isLoggedIn && (
                  <TooltipContent>
                    You must Log in to star a package
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {!isOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleForkClick}
                        disabled={
                          isForkLoading || !packageInfo?.name || !isLoggedIn
                        }
                        className={
                          isForkLoading || !packageInfo?.name || !isLoggedIn
                            ? "pointer-events-none"
                            : ""
                        }
                      >
                        <GitFork className="w-4 h-4 mr-2" />
                        Fork
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isLoggedIn && (
                    <TooltipContent>
                      <p>Log in to Fork this package</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center space-x-2 w-full justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className={
                isForkLoading || !packageInfo?.name || !isLoggedIn
                  ? "pointer-events-none"
                  : ""
              }
              onClick={handleStarClick}
              disabled={isStarLoading || !packageInfo?.name}
            >
              <Star
                className={`w-4 h-4 mr-2 ${
                  starData?.is_starred ? "fill-yellow-500 text-yellow-500" : ""
                }`}
              />
              {starData?.is_starred ? "Starred" : "Star"}
              {(starData?.star_count ?? 0) > 0 && (
                <span className="ml-1.5 bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.5 text-xs font-medium">
                  {starData?.star_count}
                </span>
              )}
            </Button>

            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleForkClick}
                className={
                  isForkLoading || !packageInfo?.name || !isLoggedIn
                    ? "pointer-events-none"
                    : ""
                }
                disabled={
                  isCurrentUserAuthor ||
                  isForkLoading ||
                  !packageInfo?.package_id
                }
              >
                <GitFork className="w-4 h-4 mr-2" />
                Fork
              </Button>
            )}
          </div>
        </div>
      </div>

      <OrderDialog
        isOpen={isOpen}
        onClose={close}
        stage={stage}
        setStage={setStage}
        packageReleaseId={packageInfo?.latest_package_release_id}
      />
    </header>
  )
}
