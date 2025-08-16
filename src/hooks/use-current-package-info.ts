import { useParams } from "wouter"
import { usePackageById } from "./use-package-by-package-id"
import { usePackageByName } from "./use-package-by-package-name"
import { useUrlParams } from "./use-url-params"
import type { Package } from "fake-snippets-api/lib/db/schema"

export const useCurrentPackageInfo = (): {
  packageInfo: Package | undefined
  isLoading: boolean
  error: (Error & { status: number }) | null
  refetch: () => Promise<unknown>
} => {
  const urlParams = useUrlParams()
  const packageIdFromQuery = urlParams.package_id ?? null

  const { author, packageName } = useParams()
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

  return { packageInfo: data, isLoading, error, refetch }
}
