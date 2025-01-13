import { Link } from "wouter"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { ComponentType, lazy } from "react"

const lazyImport = (importFn: () => Promise<any>) =>
  lazy<ComponentType<any>>(async () => {
    try {
      const module = await importFn()

      if (module.default) {
        return { default: module.default }
      }

      const pageExportNames = ["Page", "Component", "View"]
      for (const suffix of pageExportNames) {
        const keys = Object.keys(module).filter((key) => key.endsWith(suffix))
        if (keys.length > 0) {
          return { default: module[keys[0]] }
        }
      }

      const componentExport = Object.values(module).find(
        (exp) => typeof exp === "function" && exp.prototype?.isReactComponent,
      )
      if (componentExport) {
        return { default: componentExport }
      }

      throw new Error(
        `No valid React component found in module. Available exports: ${Object.keys(module).join(", ")}`,
      )
    } catch (error) {
      console.error("Failed to load component:", error)
      throw error
    }
  })

export /**
 * PrefetchPageLink component that loads page components when links become visible.
 * Routes are automatically mapped to their corresponding page components under @/pages.
 * The href path is used to determine which page to load:
 *
 * Example:
 * - href="/editor" -> loads "@/pages/editor"
 * - href="/" -> loads "@/pages/landing"
 * - href="/my-orders" -> loads "@/pages/my-orders"
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

  useEffect(() => {
    if (inView) {
      const pageName = href === "/" ? "landing" : href.slice(1)
      lazyImport(() => import(`@/pages/${pageName}`))
    }
  }, [inView, href])

  return (
    <Link {...props} href={href} className={className} ref={ref}>
      {children}
    </Link>
  )
}
