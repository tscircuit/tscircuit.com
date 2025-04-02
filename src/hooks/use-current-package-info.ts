import { useCurrentPackageId } from "./use-current-package-id"
import { usePackageById } from "./use-package-by-package-id"

export const useCurrentPackageInfo = () => {
  const { packageId } = useCurrentPackageId()
  const { data: packageInfo, ...rest } = usePackageById(packageId)
  return { packageInfo, ...rest }
}
