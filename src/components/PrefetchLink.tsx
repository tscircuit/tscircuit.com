import { Link } from "wouter"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"

export /**
 * PrefetchLink component that prefetches snippet data when links become visible.
 * Used for snippet links to preload data before navigation.
 *
 * Example:
 * - href="/username/snippet-name" -> prefetches snippet data
 */
const PrefetchLink = ({
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
    if (inView && href.split("/").length === 3) {
      const [, author, snippetName] = href.split("/")
      queryClient.prefetchQuery(["snippet", author, snippetName], async () => {
        const response = await axios.get(
          `/snippets/get?owner_name=${author}&unscoped_name=${snippetName}`,
        )
        return response.data.snippet
      })
    }
  }, [inView, href, queryClient, axios])

  return (
    <Link {...props} href={href} className={className} ref={ref}>
      {children}
    </Link>
  )
}
