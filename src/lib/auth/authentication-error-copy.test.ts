import { describe, expect, test } from "bun:test"
import { getAuthenticationErrorCopy } from "./authentication-error-copy"

describe("getAuthenticationErrorCopy", () => {
  test.each(["session_expired", "session_not_found"])(
    "uses expired-session guidance for %s",
    (errorCode) => {
      expect(getAuthenticationErrorCopy(errorCode)).toEqual({
        shouldClearSession: true,
        title: "Session Expired",
        description: "Your session has expired. Click here to sign in again.",
      })
    },
  )

  test.each(["no_token", "invalid_token"])(
    "asks the user to sign in again for %s",
    (errorCode) => {
      expect(getAuthenticationErrorCopy(errorCode)).toEqual({
        shouldClearSession: true,
        title: "Sign In Required",
        description: "Please sign in again to continue.",
      })
    },
  )

  test("does not clear local session state for an unknown 401", () => {
    expect(getAuthenticationErrorCopy("unknown")).toEqual({
      shouldClearSession: false,
      title: "Sign In Required",
      description: "Please sign in again to continue.",
    })
  })
})
