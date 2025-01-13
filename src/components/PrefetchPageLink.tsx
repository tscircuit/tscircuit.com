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
    if (inView) {
      const pageName = href === "/" ? "landing" : href.slice(1)
      import(`../../${pageName}`)
    }
  }, [inView, href])

  return (
    <Link {...props} href={href} className={className} ref={ref}>
      {children}
    </Link>
  )
}
