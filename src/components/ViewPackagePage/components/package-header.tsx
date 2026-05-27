import { useEffect, useMemo, useState } from "react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Lock, Globe } from "lucide-react"
import { GitFork, Package, Star } from "lucide-react"
import {
  OrderDialog,
  type BoardSpecification,
  type OrderDialogCheckout,
} from "@tscircuit/order-dialog"
import type { CheckoutSession } from "@tscircuit/fake-stripe/types"

import { useForkPackageMutation } from "@/hooks/use-fork-package-mutation"
import { usePackageStarringByName } from "@/hooks/use-package-stars"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import type {
  Package as PackageType,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import type { PublicOrder } from "fake-snippets-api/lib/public-mapping/public-map-order"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"
import type { AnyCircuitElement, PcbBoard } from "circuit-json"

interface PackageHeaderProps {
  packageInfo?: PackageType
  packageRelease?: PublicPackageRelease
  isPrivate?: boolean
  isCurrentUserAuthor?: boolean
}

interface CreateOrderResponse {
  ok: boolean
  order: PublicOrder
  stripe_checkout_session_id: string
  stripe_checkout_session_url: string
  url: string
}

const getPcbBoard = (circuitJson: AnyCircuitElement[] | null) =>
  circuitJson?.find((element) => element.type === "pcb_board") as
    | PcbBoard
    | undefined

const getBoardDimensions = (board: PcbBoard | undefined) => {
  if (typeof board?.width !== "number" || typeof board.height !== "number") {
    return undefined
  }

  return `${board.width} x ${board.height} mm`
}

const getOrderSpecifications = (
  circuitJson: AnyCircuitElement[] | null,
): BoardSpecification[] => {
  const board = getPcbBoard(circuitJson)
  const specifications: BoardSpecification[] = []

  if (board?.num_layers != null) {
    specifications.push({ label: "Layers", value: board.num_layers })
  }

  if (board?.thickness != null) {
    specifications.push({
      label: "Thickness",
      value: `${board.thickness} mm`,
    })
  }

  if (board?.material != null) {
    specifications.push({
      label: "Material",
      value:
        board.material === "fr4"
          ? "FR-4"
          : board.material === "fr1"
            ? "FR-1"
            : board.material,
    })
  }

  if (board?.min_trace_width != null) {
    specifications.push({
      label: "Min trace thickness",
      value: `${board.min_trace_width} mm`,
    })
  }

  if (board?.min_via_hole_diameter != null) {
    specifications.push({
      label: "Min via hole",
      value: `${board.min_via_hole_diameter} mm`,
    })
  }

  return specifications
}

const getCheckoutSessionFromCreateOrderResponse = (
  data: CreateOrderResponse,
): CheckoutSession => {
  const url = data.url ?? data.stripe_checkout_session_url
  if (!url) {
    throw new Error("Order response did not include a checkout URL")
  }

  return {
    id: data.stripe_checkout_session_id ?? "",
    url,
    status: "open",
    payment_status: "unpaid",
  } as CheckoutSession
}

function getOrderDialogCheckout({
  apiBaseUrl,
  packageReleaseId,
  sessionToken,
}: {
  apiBaseUrl: string
  packageReleaseId?: string
  sessionToken?: string
}): OrderDialogCheckout | undefined {
  if (typeof window === "undefined") return undefined
  if (!packageReleaseId) return undefined

  const appOrigin = window.location.origin

  return {
    successUrl: `${appOrigin}/orders/success`,
    cancelUrl: `${appOrigin}/orders/cancel`,
    createSession: async (_request, context): Promise<CheckoutSession> => {
      const response = await fetch(`${apiBaseUrl}/orders/create`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({
          submitted_package_release_id: packageReleaseId,
          quantity: context.quantity,
          fabricator_id: context.fabricator.id,
          fabricator_name: context.fabricator.name,
          success_url: `${appOrigin}/orders/success`,
          cancel_url: `${appOrigin}/orders/cancel`,
        }),
      })

      if (!response.ok) {
        throw new Error(`Unable to create order (${response.status})`)
      }

      const data = (await response.json()) as CreateOrderResponse
      return getCheckoutSessionFromCreateOrderResponse(data)
    },
  }
}

export default function PackageHeader({
  packageInfo,
  packageRelease,
  isPrivate = false,
  isCurrentUserAuthor = false,
}: PackageHeaderProps) {
  const packageNameWithOwner = packageInfo?.name
  const packageOwnerName = packageNameWithOwner?.includes("/")
    ? packageNameWithOwner?.split("/")[0]
    : packageInfo?.owner_github_username
  const packageOwnerHandle = packageInfo?.org_owner_tscircuit_handle
  const packageName = packageNameWithOwner?.includes("/")
    ? packageNameWithOwner?.split("/")[1]
    : packageInfo?.unscoped_name
  const sessionToken = useGlobalStore((s) => s.session?.token)
  const isOwner =
    packageInfo?.owner_github_username ===
    useGlobalStore((s) => s.session?.github_username)
  const isLoggedIn = useGlobalStore((s) => s.session != null)
  const isTscircuitStaff = useGlobalStore((s) => s.session?.is_tscircuit_staff)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const apiBaseUrl = useApiBaseUrl()
  const orderDialogCheckout = useMemo(
    () =>
      getOrderDialogCheckout({
        apiBaseUrl,
        packageReleaseId: packageRelease?.package_release_id,
        sessionToken,
      }),
    [apiBaseUrl, packageRelease?.package_release_id, sessionToken],
  )
  const { circuitJson } = useCurrentPackageCircuitJson()
  const orderSpecifications = useMemo(
    () => getOrderSpecifications(circuitJson),
    [circuitJson],
  )
  const boardDimensions = useMemo(
    () => getBoardDimensions(getPcbBoard(circuitJson)),
    [circuitJson],
  )
  const cadPreviewImageUrl =
    packageRelease?.cad_preview_image_url ??
    packageInfo?.latest_cad_preview_image_url ??
    undefined

  const { isStarred, starCount, toggleStar } = usePackageStarringByName(
    packageInfo?.name ?? null,
  )

  const { mutateAsync: forkPackage, isLoading: isForkLoading } =
    useForkPackageMutation()

  const handleStarClick = async () => {
    if (!packageInfo?.name || !isLoggedIn) return
    await toggleStar()
  }

  const handleForkClick = async () => {
    if (!packageInfo?.package_id || !isLoggedIn) return
    await forkPackage({
      packageId: packageInfo.package_id,
      isPrivate,
    })
  }

  const handleOrderClick = () => {
    if (!packageInfo?.name || !packageRelease?.package_release_id) return
    setIsOrderDialogOpen(true)
  }

  useEffect(() => {
    window.TSCIRCUIT_REGISTRY_API_BASE_URL =
      import.meta.env.VITE_TSCIRCUIT_REGISTRY_API_URL ??
      `${window.location.origin}/api`
    // TODO: replace with production stripe checkout base url
    window.TSCIRCUIT_STRIPE_CHECKOUT_BASE_URL =
      import.meta.env.VITE_TSCIRCUIT_STRIPE_CHECKOUT_BASE_URL
  }, [sessionToken])

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center min-w-0 flex-wrap">
            {packageName ? (
              <>
                <h1 className="text-lg md:text-xl font-bold mr-2 break-words">
                  <Link
                    href={`/${packageOwnerHandle || packageOwnerName}`}
                    className="text-blue-600 hover:underline"
                  >
                    {packageOwnerName}
                  </Link>
                  <span className="px-1 text-gray-500">/</span>
                  <Link
                    href={`/${packageNameWithOwner}`}
                    className="text-blue-600 hover:underline"
                    onClick={() =>
                      setTimeout(
                        () => window.dispatchEvent(new Event("popstate")),
                        0,
                      )
                    }
                  >
                    {packageName}
                  </Link>
                </h1>
                {packageInfo?.name && (
                  <div
                    className={`select-none inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      isPrivate
                        ? "bg-gray-100 text-gray-700 border border-gray-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {isPrivate ? (
                      <>
                        <Lock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="leading-none">Private</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="leading-none">Public</span>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <Skeleton className="h-6 w-72" />
            )}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {isTscircuitStaff && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOrderClick}
                disabled={
                  !packageInfo?.name || !packageRelease?.package_release_id
                }
              >
                <Package className="w-4 h-4 mr-2" />
                Order
              </Button>
            )}

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
                      disabled={!packageInfo?.name || !isLoggedIn}
                    >
                      <Star
                        className={`w-4 h-4 mr-2 ${
                          isStarred ? "fill-yellow-500 text-yellow-500" : ""
                        }`}
                      />
                      {isStarred ? "Starred" : "Star"}
                      {(starCount ?? 0) > 0 && (
                        <span className="ml-1.5 bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.5 text-xs font-medium">
                          {starCount}
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
            {isTscircuitStaff && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOrderClick}
                disabled={
                  !packageInfo?.name || !packageRelease?.package_release_id
                }
              >
                <Package className="w-4 h-4 mr-2" />
                Order
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className={
                isForkLoading || !packageInfo?.name || !isLoggedIn
                  ? "pointer-events-none"
                  : ""
              }
              onClick={handleStarClick}
              disabled={!packageInfo?.name || !isLoggedIn}
            >
              <Star
                className={`w-4 h-4 mr-2 ${
                  isStarred ? "fill-yellow-500 text-yellow-500" : ""
                }`}
              />
              {isStarred ? "Starred" : "Star"}
              {(starCount ?? 0) > 0 && (
                <span className="ml-1.5 bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.5 text-xs font-medium">
                  {starCount}
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
      {isOrderDialogOpen && (
        <OrderDialog
          checkout={orderDialogCheckout}
          boardImage={
            cadPreviewImageUrl
              ? { src: cadPreviewImageUrl, alt: "3D PCB preview" }
              : undefined
          }
          project={{
            name: packageInfo?.name ?? packageName ?? "Package",
            version: packageRelease?.version
              ? `v${packageRelease.version}`
              : packageInfo?.latest_version
                ? `v${packageInfo.latest_version}`
                : "latest",
            dimensions: boardDimensions,
          }}
          specifications={orderSpecifications}
          onClose={() => setIsOrderDialogOpen(false)}
          onSubmit={() => setIsOrderDialogOpen(false)}
        />
      )}
    </header>
  )
}
