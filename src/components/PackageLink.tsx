import type { Package } from "fake-snippets-api/lib/db/schema"
import { Star } from "lucide-react"
import { Link } from "wouter"

export const PackageLink = (pkg: Package) => {
  return (
    <>
      <Link
        className="text-blue-500 font-semibold hover:underline"
        href={`/${pkg.owner_github_username}`}
      >
        {pkg.owner_github_username}
      </Link>
      <span className="px-0.5 text-gray-500">/</span>
      <Link
        className="text-blue-500  font-semibold hover:underline"
        href={`/${pkg.unscoped_name}`}
      >
        {pkg.unscoped_name}
      </Link>
      {pkg.star_count !== undefined && (
        <span className="ml-2 text-gray-500 text-xs flex items-center">
          <Star className="w-3 h-3 mr-1" />
          {pkg.star_count}
        </span>
      )}
    </>
  )
}
