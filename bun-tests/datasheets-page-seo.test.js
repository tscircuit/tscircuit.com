import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

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
