import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

const PROXY_HEADERS = [
  "X-Target-Url",
  "X-Sender-Origin",
  "X-Sender-Host",
  "X-Sender-Referer",
  "X-Sender-User-Agent",
  "X-Sender-Cookie",
]

const ALLOWED_DOMAINS: Array<{ domain: string; routes?: string[] }> = [
  { domain: "easyeda.com" },
  { domain: "jlcpcb.com" },
]

function isAllowedDomain(url: string) {
  try {
    const { hostname, pathname, port } = new URL(url)
    const allowedDomain = ALLOWED_DOMAINS.find(
      (domain) => domain.domain === hostname,
    )

    if (allowedDomain) {
      if (
        !allowedDomain.routes ||
        allowedDomain.routes.some((route) => pathname.startsWith(route))
      ) {
        return true
      }
    }

    return hostname === "localhost" || (hostname === "127.0.0.1" && port)
  } catch {
    return false
  }
}

export default withRouteSpec({
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  jsonResponse: z.any(),
  auth: "session",
})(async (req, ctx) => {
  if (req.headers.get("X-proxied")) {
    return ctx.json(
      { error: "Recursive proxy calls are not allowed" },
      { status: 403 },
    )
  }

  const targetUrl = req.headers.get("X-Target-Url")

  if (!targetUrl) {
    return ctx.json(
      { error: "X-Target-Url header is required" },
      { status: 400 },
    )
  }

  if (!isAllowedDomain(targetUrl)) {
    return ctx.json({ error: "Domain not allowed" }, { status: 403 })
  }

  let body: string | undefined
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    body = await req.clone().text()
  }

  const headers = new Headers(req.headers)

  const senderOrigin = req.headers.get("X-Sender-Origin")
  if (senderOrigin) {
    headers.set("Origin", senderOrigin)
  }

  const senderHost = req.headers.get("X-Sender-Host")
  if (senderHost) {
    const hostValue = senderHost.replace(/^https?:\/\//, "")
    headers.set("Host", hostValue)
    headers.set("authority", hostValue)
  }

  const senderReferer = req.headers.get("X-Sender-Referer")
  if (senderReferer) {
    headers.set("Referer", senderReferer)
  }

  const senderUserAgent = req.headers.get("X-Sender-User-Agent")
  if (senderUserAgent) {
    headers.set("User-Agent", senderUserAgent)
  }

  const senderCookie = req.headers.get("X-Sender-Cookie")
  if (senderCookie) {
    headers.set("Cookie", senderCookie)
  }

  for (const header of PROXY_HEADERS) {
    headers.delete(header)
  }

  headers.delete("content-encoding")
  headers.delete("accept-encoding")
  headers.set("X-proxied", "true")

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : body,
    })

    const responseHeaders = new Headers(response.headers)
    responseHeaders.delete("content-encoding")

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return ctx.json(
      { error: { message: "Failed to proxy request" } },
      { status: 502 },
    )
  }
})
