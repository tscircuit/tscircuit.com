import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import he from "he"

// Load the real HTML template without requiring a production build in Bun tests.
const previousDevSsr = process.env.TSC_DEV_SSR
process.env.TSC_DEV_SSR = "true"
const { default: handler } = await import("../api/generated-index.js")
if (previousDevSsr === undefined) {
  delete process.env.TSC_DEV_SSR
} else {
  process.env.TSC_DEV_SSR = previousDevSsr
}

async function getPage(url) {
  const response = {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    send(html) {
      this.html = html
    },
  }
  await handler({ url }, response)
  return response
}

describe("datasheets index SEO", () => {
  test.each([
    "/datasheets",
    "/datasheets/",
    "/datasheets?utm_source=search",
    "/datasheets/?utm_source=search",
  ])("serves index metadata instead of a user profile for %s", async (url) => {
    const { html, statusCode, headers } = await getPage(url)
    expect(statusCode).toBe(200)
    expect(headers["Content-Type"]).toBe("text/html; charset=utf-8")
    expect(html).toContain(
      "<title>Electronic Component Datasheets - tscircuit</title>",
    )
    const description =
      "Browse and search electronic component datasheets on tscircuit. Find chip descriptions, PDF datasheets, pinouts, and pin information for your circuit designs."
    expect(html).toContain(`content="${description}"`)
    expect(html).toContain(
      `<meta property="og:description"\n    content="${description}" />`,
    )
    expect(html).toContain(
      `<meta name="twitter:description" content="${description}" />`,
    )
    expect(html).toContain(
      '<link rel="canonical" href="https://tscircuit.com/datasheets" />',
    )
    expect(html).toContain(
      '<meta property="og:image" content="https://tscircuit.com/tscircuit-logo.png" />',
    )
    expect(html).toContain(
      '<meta name="twitter:image" content="https://tscircuit.com/tscircuit-logo.png" />',
    )
    expect(html).not.toContain("Circuits created by datasheets")
    expect(html).not.toContain("github.com/datasheets.png")
  })

  test("references a stable, square, high-resolution brand icon", async () => {
    const { html } = await getPage("/datasheets")
    expect(html).toContain(
      '<link rel="icon" href="/tscircuit-logo.png" type="image/png" sizes="460x460" />',
    )
    const image = readFileSync(
      new URL("../public/tscircuit-logo.png", import.meta.url),
    )
    expect(image.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
    expect(image.readUInt32BE(16)).toBe(460)
    expect(image.readUInt32BE(20)).toBe(460)
    const config = JSON.parse(
      readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
    )
    expect(
      config.rewrites.find((rewrite) => rewrite.source === "/favicon.ico")
        .destination,
    ).toBe("/tscircuit-logo.png")
  })
})

describe("datasheet TSX in server-rendered HTML", () => {
  test("includes the complete escaped TSX and requests the decoded chip name", async () => {
    const tsx = `export const Example = () => <chip pinAttributes={{ pin1: { requiresVoltage: 2.8 } }} />\n// </code><script>alert("x")</script>\n// $& $\x60 $' $$`
    const originalFetch = globalThis.fetch
    let requestedUrl
    globalThis.fetch = async (request) => {
      requestedUrl = new URL(request.url)
      return Response.json({ datasheet: { generated_tsx: tsx } })
    }
    try {
      const { html, statusCode } = await getPage("/datasheets/EXAMPLE%2B64")
      expect(statusCode).toBe(200)
      expect(requestedUrl.pathname).toBe("/datasheets/get")
      expect(requestedUrl.searchParams.get("chip_name")).toBe("EXAMPLE+64")
      expect(html).toContain("data-ssr-datasheet-page")
      expect(html).toContain("EXAMPLE+64 Datasheet")
      expect(html).toContain(
        '<summary class="cursor-pointer p-6 text-xl font-semibold">TSX</summary>',
      )
      expect(he.decode(html.match(/<code>([\s\S]*?)<\/code>/)[1])).toBe(tsx)
      expect(html).not.toContain('<script>alert("x")</script>')
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test.each([null, "", "   "])("omits unavailable TSX (%s)", async (tsx) => {
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () =>
      Response.json({ datasheet: { generated_tsx: tsx } })
    try {
      const { html, statusCode } = await getPage("/datasheets/EXAMPLE64")
      expect(statusCode).toBe(200)
      expect(html).not.toContain("<code>")
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  test.each([404, 503])(
    "keeps the page available when the API returns %s without retrying",
    async (status) => {
      const originalFetch = globalThis.fetch
      let requests = 0
      globalThis.fetch = async () => {
        requests++
        return new Response("Unavailable", { status })
      }
      try {
        const { html, statusCode } = await getPage("/datasheets/EXAMPLE64")
        expect(statusCode).toBe(200)
        expect(html).toContain("EXAMPLE64 Datasheet")
        expect(html).not.toContain("<code>")
        expect(requests).toBe(1)
      } finally {
        globalThis.fetch = originalFetch
      }
    },
  )

  test("limits a stalled API request to five seconds", async () => {
    const originalFetch = globalThis.fetch
    let requests = 0
    globalThis.fetch = () => {
      requests++
      return new Promise(() => {})
    }
    const started = performance.now()
    try {
      const { html, statusCode } = await getPage("/datasheets/EXAMPLE64")
      expect(statusCode).toBe(200)
      expect(html).not.toContain("<code>")
      expect(requests).toBe(1)
      expect(performance.now() - started).toBeGreaterThanOrEqual(4900)
      expect(performance.now() - started).toBeLessThan(6500)
    } finally {
      globalThis.fetch = originalFetch
    }
  }, 8000)
})
