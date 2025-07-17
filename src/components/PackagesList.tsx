import { Button } from "@/components/ui/button"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { ChevronDown, ChevronUp, Star } from "lucide-react"
import { Link } from "wouter"

interface PackagesListProps {
  title: string
  packages?: Package[]
  showAll?: boolean
  onToggleShowAll?: () => void
  maxItems?: number
}

export const PackagesList = ({
  title,
  packages = [],
  showAll = false,
  onToggleShowAll,
  maxItems = 5,
}: PackagesListProps) => {
  const displayedPackages = showAll ? packages : packages.slice(0, maxItems)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700">{title}</h2>
        {packages.length > maxItems && onToggleShowAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleShowAll}
            className="text-blue-600 hover:text-blue-700 hover:bg-transparent"
          >
            {showAll ? (
              <>
                Show less <ChevronUp className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
      <div className="border-b border-gray-200" />
      {packages && (
        <ul className="space-y-1 mt-2">
          {displayedPackages.map((pkg) => (
            <li key={pkg.package_id}>
              <div className="flex items-center">
                <Link
                  href={`/${pkg.owner_github_username}/${pkg.unscoped_name}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {pkg.owner_github_username}/{pkg.unscoped_name}
                </Link>
                {pkg.star_count > 0 && (
                  <span className="ml-2 text-gray-500 text-xs flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    {pkg.star_count}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
