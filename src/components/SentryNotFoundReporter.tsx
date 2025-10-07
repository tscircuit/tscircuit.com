import { useEffect, useRef } from "react"
import { Sentry } from "@/lib/sentry"

type NotFoundContext = "package" | "package_release"

type SentryNotFoundReporterProps = {
  context: NotFoundContext
  slug: string
  status?: number
  message?: string
}

export const SentryNotFoundReporter = ({
  context,
  slug,
  status,
  message,
}: SentryNotFoundReporterProps) => {
  const hasLoggedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (typeof slug !== "string" || slug.length === 0) return
    if (typeof status === "number" && status !== 404) return
    if (hasLoggedRef.current) return

    hasLoggedRef.current = true

    Sentry.captureMessage(`package:view:${context}-not-found`, {
      level: "warning",
      tags: {
        slug,
      },
      extra: {
        status,
        message,
      },
    })
  }, [context, slug, status, message])

  return null
}

export default SentryNotFoundReporter
