import { useEffect, useState } from "react"
import { Link } from "wouter"
import { useInView } from "react-intersection-observer"
import {
  type RelatedPackage,
  useRelatedPackages,
} from "@/hooks/use-related-packages"

const relationshipLabels: Record<RelatedPackage["related_type"], string> = {
  same_author: "More from this author",
  similar_ai_description: "Similar package",
  random: "Discover something new",
}

const useBrowserIdle = () => {
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const idleCallback = window.requestIdleCallback(() => setIsIdle(true), {
        timeout: 1_500,
      })
      return () => window.cancelIdleCallback(idleCallback)
    }

    const timeout = setTimeout(() => setIsIdle(true), 0)
    return () => clearTimeout(timeout)
  }, [])

  return isIdle
}

const RelatedPackageCard = ({ pkg }: { pkg: RelatedPackage }) => (
  <Link
    href={`/${pkg.name}`}
    className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-gray-300 dark:border-[#30363d] dark:bg-[#0d1117] dark:hover:border-gray-500"
  >
    <div className="aspect-[16/9] overflow-hidden border-b border-gray-200 bg-gray-50 dark:border-[#30363d] dark:bg-[#161b22]">
      <img
        src={pkg.thumbnail_url}
        alt={`${pkg.name} preview`}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </div>
    <div className="p-4">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {relationshipLabels[pkg.related_type]}
      </div>
      <h3 className="truncate font-semibold text-blue-600 group-hover:text-blue-700 dark:text-[#58a6ff]">
        {pkg.name}
      </h3>
      {pkg.description && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {pkg.description}
        </p>
      )}
    </div>
  </Link>
)

export const RelatedPackagesSection = ({
  packageId,
}: {
  packageId: string | null
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100px 0px",
  })
  const isBrowserIdle = useBrowserIdle()
  const { data: relatedPackages, isLoading } = useRelatedPackages(
    packageId,
    inView && isBrowserIdle,
  )

  return (
    <div ref={ref} className="min-h-px" data-testid="related-packages-boundary">
      {isLoading && inView ? (
        <section
          aria-label="Loading related packages"
          className="mx-auto max-w-[1200px] border-t border-gray-200 px-4 py-8 dark:border-[#30363d]"
        >
          <div className="mb-5 h-7 w-44 animate-pulse rounded bg-gray-100 dark:bg-[#161b22]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="aspect-[4/3] animate-pulse rounded-lg bg-gray-100 dark:bg-[#161b22]"
              />
            ))}
          </div>
        </section>
      ) : relatedPackages?.length ? (
        <section
          aria-labelledby="related-packages-heading"
          className="mx-auto max-w-[1200px] border-t border-gray-200 px-4 py-8 dark:border-[#30363d]"
        >
          <h2
            id="related-packages-heading"
            className="mb-5 text-xl font-semibold text-gray-900 dark:text-[#c9d1d9]"
          >
            Related Packages
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedPackages.map((pkg) => (
              <RelatedPackageCard key={pkg.package_id} pkg={pkg} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
