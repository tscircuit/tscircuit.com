import { expect, test } from "bun:test"
import config from "../vercel.json"

test("Git endpoints reach the registry before page rendering", () => {
  const route = config.routes[0]!
  const pattern = new RegExp(route.src)
  for (const path of [
    "/astra/pd-power-supply/info/refs",
    "/astra/pd-power-supply/git-upload-pack",
    "/astra/pd-power-supply.git/info/refs",
    "/astra/pd-power-supply.git/git-upload-pack",
    "/astra/pd-power-supply/git-receive-pack",
  ]) {
    expect(path.replace(pattern, route.dest)).toBe(
      `https://api.tscircuit.com/git${path}`,
    )
  }
  expect(pattern.test("/astra/pd-power-supply")).toBe(false)
  expect(pattern.test("/astra/pd-power-supply/files/index.tsx")).toBe(false)
})
