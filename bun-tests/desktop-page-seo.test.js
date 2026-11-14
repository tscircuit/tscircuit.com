import { expect, test } from "bun:test"

const previousDevSsr = process.env.TSC_DEV_SSR
process.env.TSC_DEV_SSR = "true"
const { default: handler } = await import("../api/generated-index.js")
if (previousDevSsr === undefined) delete process.env.TSC_DEV_SSR
else process.env.TSC_DEV_SSR = previousDevSsr

test.each(["/desktop", "/desktop/", "/desktop?utm_source=product"])(
  "serves Desktop metadata instead of a user profile for %s",
  async (url) => {
    const response = {
      setHeader() {},
      status(code) {
        expect(code).toBe(200)
        return this
      },
      send(html) {
        expect(html).toContain(
          "<title>tscircuit Desktop — Design electronics with AI agents</title>",
        )
        expect(html).toContain(
          '<link rel="canonical" href="https://tscircuit.com/desktop" />',
        )
        expect(html).toContain(
          "A desktop app for designing electronics with AI agents",
        )
        expect(html).not.toContain("Circuits created by desktop")
        expect(html).not.toContain("github.com/desktop.png")
      },
    }
    await handler({ url }, response)
  },
)
