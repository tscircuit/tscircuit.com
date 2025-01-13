import { Link } from "wouter"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"

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
    console.log(inView)
    if (inView) {
      const pageName = href === "/" ? "landing" : href.slice(1)
      // Prefetch the page module
      const imported = import(`@/pages/${pageName}`).catch((error) => {
        console.error(`Failed to prefetch page module ${pageName}:`, error)
      })
      console.log("imported:", imported)
    }
  }, [inView, href])

  return (
    <Link {...props} href={href} className={className} ref={ref}>
      {children}
    </Link>
  )
}
