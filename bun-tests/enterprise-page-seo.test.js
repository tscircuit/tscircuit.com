import { expect, test } from "bun:test"

const previousDevSsr = process.env.TSC_DEV_SSR
process.env.TSC_DEV_SSR = "true"
const { default: handler } = await import("../api/generated-index.js")
if (previousDevSsr === undefined) delete process.env.TSC_DEV_SSR
else process.env.TSC_DEV_SSR = previousDevSsr

test.each(["/enterprise", "/enterprise/", "/enterprise?utm_source=product"])(
  "serves Enterprise metadata instead of a user profile for %s",
  async (url) => {
    const response = {
      setHeader() {},
      status(code) {
        expect(code).toBe(200)
        return this
      },
      send(html) {
        expect(html).toContain(
          "<title>tscircuit Enterprise — Offline circuit design</title>",
        )
        expect(html).toContain(
          '<link rel="canonical" href="https://tscircuit.com/enterprise" />',
        )
        expect(html).toContain(
          "bundled JavaScript runtime and local viewer assets",
        )
        expect(html).not.toContain("Circuits created by enterprise")
        expect(html).not.toContain("github.com/enterprise.png")
      },
    }
    await handler({ url }, response)
  },
)
