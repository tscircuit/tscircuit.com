import { TypeBadge } from "@/components/TypeBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useForkPackageMutation } from "@/hooks/use-fork-package-mutation"
import {
  usePackageStarMutationByName,
  usePackageStarsByName,
} from "@/hooks/use-package-stars"
import { LockClosedIcon } from "@radix-ui/react-icons"
import { GitFork, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Link } from "wouter"

interface PackageInfo {
  name: string
  unscoped_name: string
  owner_github_username: string
  star_count: string
  description: string
  ai_description: string
  creator_account_id?: string
  owner_org_id?: string
  package_id: string
}

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

  const { toast } = useToast()

  const { data: starData, isLoading: isStarDataLoading } =
    usePackageStarsByName(packageInfo?.name ?? null)
  const { addStar, removeStar } = usePackageStarMutationByName(
    packageInfo?.name ?? "",
  )

  const { mutateAsync: forkPackage, isLoading: isForkLoading } = useForkPackageMutation()

  const handleStarClick = async () => {
    if (!packageInfo?.name) return

    if (starData?.is_starred) {
      await removeStar.mutateAsync()
    } else {
      await addStar.mutateAsync()
    }
  }

  const handleForkClick = async () => {
    if (!packageInfo?.package_id) return
    await forkPackage(packageInfo.package_id)
    toast({
      title: "Forked package",
      description: "Package forked successfully",
    })
  }

  const isStarLoading =
    isStarDataLoading || addStar.isLoading || removeStar.isLoading

  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {author && packageName ? (
              <>
                <h1 className="text-xl font-bold mr-2">
                  <Link href={`/${author}`} className="text-blue-600">
                    {author}
                  </Link>
                  <span className="px-1 text-gray-500">/</span>
                  <Link
                    className="text-blue-600"
                    href={`/${author}/${packageName}`}
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStarClick}
              disabled={isStarLoading || !packageInfo?.name}
            >
              <Star
                className={`w-4 h-4 mr-2 ${starData?.is_starred ? "fill-yellow-500 text-yellow-500" : ""}`}
              />
              {starData?.is_starred ? "Starred" : "Star"}
              {(starData?.star_count ?? 0) > 0 && (
                <span className="ml-1.5 bg-gray-100 text-gray-700 rounded-full px-1.5 py-0.5 text-xs font-medium">
                  {starData?.star_count}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleForkClick}
              disabled={isCurrentUserAuthor || isForkLoading || !packageInfo?.package_id}
            >
              <GitFork className="w-4 h-4 mr-2" />
              Fork
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
