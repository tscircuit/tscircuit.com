import { expect, test } from "bun:test"
import { getDesktopOperatingSystem } from "../src/lib/enterprise-downloads"

test.each([
  ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Windows"],
  ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "macOS"],
  ["Mozilla/5.0 (X11; Linux x86_64)", "Linux"],
  ["Mozilla/5.0 (X11; Linux aarch64)", "Linux"],
  ["Mozilla/5.0 (Linux; Android 14; Pixel 8)", null],
  ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", null],
  ["Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", null],
  ["Mozilla/5.0 (X11; CrOS x86_64 16000.0.0)", null],
  ["Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1)", null],
  ["Mozilla/5.0 (X11; FreeBSD amd64)", null],
  ["", null],
] as const)("detects a desktop OS from %s", (userAgent, expected) => {
  expect(getDesktopOperatingSystem(userAgent)).toBe(expected)
})

test("does not recommend a Mac installer to iPadOS in desktop mode", () => {
  expect(
    getDesktopOperatingSystem(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      5,
    ),
  ).toBeNull()
})
