import { expect, test } from "bun:test"
import { getEasyEdaProxyAuthToast } from "@/components/package-port/get-easyeda-proxy-auth-toast"

const optionalWarning = (code = "no_token") => ({
  type: "source_part_not_found_warning",
  message: `Failed to fetch supplier footprint for resistor R1 (jlcpcb:C21190): EasyEDA proxy request failed: ${code} (HTTP 401)`,
  supplier_name: "jlcpcb",
  supplier_part_number: "C21190",
})
const requiredWarning = {
  type: "source_part_not_found_warning",
  message:
    "Failed to fetch supplier part numbers for connector J1: EasyEDA proxy request failed: no_token (HTTP 401)",
}

test("anonymous Run does not show an auth toast for optional supplier footprint checks", () => {
  for (const code of [
    "no_token",
    "unauthorized",
    "invalid_token",
    "session_expired",
  ]) {
    expect(
      getEasyEdaProxyAuthToast({ circuitJson: [optionalWarning(code)] }),
    ).toBeNull()
  }
})

test("required component imports still ask an anonymous user to sign in", () => {
  expect(
    getEasyEdaProxyAuthToast({ circuitJson: [requiredWarning] })?.title,
  ).toBe("Sign In Required")
})

test("an optional warning cannot mask a required import's auth failure", () => {
  expect(
    getEasyEdaProxyAuthToast({
      circuitJson: [optionalWarning("session_expired"), requiredWarning],
    })?.title,
  ).toBe("Sign In Required")
})

test("signed-in proxy failures retain their existing auth handling", () => {
  expect(
    getEasyEdaProxyAuthToast({
      circuitJson: [optionalWarning("session_expired")],
      sessionToken: "test-session",
    })?.title,
  ).toBe("Session Expired")
})

test("unrelated circuit warnings do not produce auth toasts", () => {
  expect(
    getEasyEdaProxyAuthToast({
      circuitJson: [
        { type: "source_part_not_found_warning", message: "Part not found" },
      ],
    }),
  ).toBeNull()
  expect(getEasyEdaProxyAuthToast({ circuitJson: null })).toBeNull()
})
