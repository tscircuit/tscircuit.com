import { usePackagePreviewIdentity } from "@/components/PackagePreviewScope"
import { usePackageById } from "./use-package-by-package-id"
import { usePackageByName } from "./use-package-by-package-name"
import type { Package } from "fake-snippets-api/lib/db/schema"

export const useCurrentPackageInfo = (): {
  packageInfo: Package | undefined
  isLoading: boolean
  error: (Error & { status: number }) | null
  refetch: () => Promise<unknown>
  isFetched: boolean
  packageSlug: string | null
} => {
  const { author, packageName, packageId } = usePackagePreviewIdentity()
  const packageIdFromQuery = packageId ?? null
  const packageSlug = author && packageName ? `${author}/${packageName}` : null

  const queryById = usePackageById(packageIdFromQuery)
  const queryByName = usePackageByName(packageSlug)

  const data = queryById.data ?? queryByName.data
  const isLoading = queryById.isLoading || queryByName.isLoading
  const error =
    (queryById.error as (Error & { status: number }) | null) ??
    (queryByName.error as (Error & { status: number }) | null) ??
    null

  const refetch = packageIdFromQuery ? queryById.refetch : queryByName.refetch

  return {
    packageInfo: data,
    isLoading,
    error,
    refetch,
    isFetched: queryById.isFetched || queryByName.isFetched,
    packageSlug,
  }
}
