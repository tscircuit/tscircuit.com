import { expect, test } from "bun:test"

const previousDevSsr = process.env.TSC_DEV_SSR
process.env.TSC_DEV_SSR = "true"
const { default: handler } = await import("../api/generated-index.js")
if (previousDevSsr === undefined) delete process.env.TSC_DEV_SSR
else process.env.TSC_DEV_SSR = previousDevSsr

for (const [path, title] of [
  ["professional-support", "Professional Support"],
  ["verified-chips", "Verified Chips Program"],
]) {
  test.each([`/${path}`, `/${path}/`, `/${path}?utm_source=solutions`])(
    "serves solution metadata instead of a user profile for %s",
    async (url) => {
      let sent = false
      const response = {
        setHeader() {},
        status(code) {
          expect(code).toBe(200)
          return this
        },
        send(html) {
          sent = true
          expect(html).toContain(`<title>${title} — tscircuit</title>`)
          expect(html).toContain(`href="https://tscircuit.com/${path}"`)
          expect(html).not.toContain(`github.com/${path}.png`)
        },
      }
      await handler({ url }, response)
      expect(sent).toBe(true)
    },
  )
}
