import { useAxios } from "@/hooks/useAxios"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { useQueryClient } from "react-query"
import { Link } from "wouter"

// Whitelist of known pages that can be safely prefetched
const PREFETCHABLE_PAGES = new Set([
  "landing",
  "editor",
  "search",
  "trending",
  "dashboard",
  "latest",
  "settings",
  "quickstart",
  "datasheets",
])

// Helper to check if a path is a package path (e.g. /username/package-name)
const isPackagePath = (path: string) => {
  const parts = path.split("/").filter(Boolean)
  if (parts.length !== 2) return false

  // Make sure we're not matching paths with query parameters in the first segment
  const firstPart = parts[0].split("?")[0]
  return firstPart.length > 0 && !PREFETCHABLE_PAGES.has(firstPart)
}

// Helper to check if a path is a user profile path
const isUserProfilePath = (path: string) => {
  const parts = path.split("/").filter(Boolean)
  if (parts.length !== 1) return false

  // Extract the base path without query parameters
  const basePath = parts[0].split("?")[0]
  return !PREFETCHABLE_PAGES.has(basePath)
}

export const PrefetchPageLink = ({
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

    // Handle user profile paths
    if (isUserProfilePath(path)) {
      const username = path.split("/")[0]
      // Prefetch user profile data
      queryClient.prefetchQuery(["account", username], async () => {
        const { data } = await axios.post("/accounts/get", {
          github_username: username,
        })
        return data.account
      })
      return
    }

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
