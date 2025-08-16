import { useCurrentPackageInfo } from "./use-current-package-info"

export const useCurrentPackageId = (): {
  packageId: string | null
  isLoading: boolean
  error: (Error & { status: number }) | null
} => {
  const { packageInfo, isLoading, error } = useCurrentPackageInfo()
  const packageId = packageInfo?.package_id ?? null

  return {
    packageId,
    isLoading,
    error,
  }
}
