import { Link } from "wouter"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"

// Whitelist of known pages that can be safely prefetched
const PREFETCHABLE_PAGES = new Set([
  "landing",
  "editor",
  "search",
  "trending",
  "dashboard",
  "quickstart",
])

// Helper to check if a path is a package path (e.g. /username/package-name)
const isPackagePath = (path: string) => {
  const parts = path.split("/").filter(Boolean)
  return (
    parts.length === 2 && !parts[0].includes(".") && !parts[1].includes(".")
  )
}

export /**
 * PrefetchPageLink component that loads page components when links become visible.
 * Routes are automatically mapped to their corresponding page components under @/pages.
 * The href path is used to determine which page to load:
 *
 * Example:
 * - href="/editor" -> loads "@/pages/editor.tsx"
 * - href="/" -> loads "@/pages/landing.tsx"
 * - href="/my-orders" -> loads "@/pages/my-orders.tsx"
 */
const PrefetchPageLink = ({
  href,
  children,
  className,
  ...props
}: {
  href: string
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
  })
  const queryClient = useQueryClient()
  const axios = useAxios()

  useEffect(() => {
    if (!inView) return

    const path = href === "/" ? "landing" : href.slice(1)
    if (!path) return

    // Handle package paths
    if (isPackagePath(path)) {
      const [owner, name] = path.split("/")
      const packageName = name.split("#")[0]
      // Prefetch package data
      queryClient.prefetchQuery(
        ["package", `${owner}/${packageName}`],
        async () => {
          const { data } = await axios.get("/packages/get", {
            params: { name: `${owner}/${packageName}` },
          })
          return data.package
        },
      )
      return
    }

    // Handle regular pages
    const pageName = path.split("?")[0]
    if (PREFETCHABLE_PAGES.has(pageName)) {
      import(`@/pages/${pageName}.tsx`).catch((error) => {
        console.error(`Failed to prefetch page module ${pageName}:`, error)
      })
    }
  }, [inView, href])

  return (
    <Link {...props} href={href} className={className} ref={ref}>
      {children}
    </Link>
  )
}
