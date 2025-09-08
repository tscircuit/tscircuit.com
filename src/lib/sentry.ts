import * as Sentry from "@sentry/react"

if (
  typeof window !== "undefined" &&
  import.meta.env.VITE_SENTRY_DSN &&
  !window.location.hostname.includes("localhost") &&
  !window.location.hostname.includes("127.0.0.1")
) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
  })
}

export { Sentry }
