import { expect, test } from "bun:test"
import { getAvatarUploadErrorMessage } from "@/lib/get-avatar-upload-error-message"

test.each([
  { data: { error: { message: "Avatar file is empty" } } },
  { data: { message: "Avatar file is empty" } },
  { response: { data: { error: { message: "Avatar file is empty" } } } },
  { response: { data: { message: "Avatar file is empty" } } },
])("preserves the API rejection reason: %j", (error) => {
  expect(getAvatarUploadErrorMessage(error)).toBe("Avatar file is empty")
})

test("prefers the server's explanation to the HTTP fallback", () => {
  expect(
    getAvatarUploadErrorMessage({
      status: 503,
      data: { message: "Avatar uploads are temporarily unavailable" },
    }),
  ).toBe("Avatar uploads are temporarily unavailable")
})

test("ignores malformed and blank messages without hiding a useful reason", () => {
  expect(
    getAvatarUploadErrorMessage({
      data: { error: { message: { detail: "invalid" } }, message: "  " },
      response: { data: { message: "  The image could not be read.  " } },
    }),
  ).toBe("The image could not be read.")
})

test.each([
  [401, "Please sign in again before uploading your avatar."],
  [403, "You don't have permission to update this avatar."],
  [
    413,
    "The image is too large to upload. Choose a smaller image (up to 5MB).",
  ],
  [415, "This image format isn't supported. Try a PNG, JPG, or GIF image."],
  [429, "Too many upload attempts. Please wait a moment and try again."],
  [500, "The server couldn't save your avatar. Please try again later."],
  [503, "The server couldn't save your avatar. Please try again later."],
])("explains HTTP %i when there is no API message", (status, message) => {
  expect(getAvatarUploadErrorMessage({ status, data: "" })).toBe(message)
  expect(
    getAvatarUploadErrorMessage({
      response: { status, data: "<html>Upload failed</html>" },
      message: `Request failed with status code ${status}`,
    }),
  ).toBe(message)
})

test.each([
  new TypeError("Failed to fetch"),
  new TypeError("Load failed"),
  new TypeError("NetworkError when attempting to fetch resource."),
  { code: "ERR_NETWORK" },
  { status: 0 },
])("explains a network failure: %j", (error) => {
  expect(getAvatarUploadErrorMessage(error)).toBe(
    "Unable to reach the upload server. Check your internet connection and try again.",
  )
})

test("preserves ordinary Error messages", () => {
  expect(
    getAvatarUploadErrorMessage(new Error("The image could not be read.")),
  ).toBe("The image could not be read.")
})

test.each([null, undefined, {}, { data: "<html>Upload failed</html>" }])(
  "provides a next step for an unknown failure: %j",
  (error) => {
    expect(getAvatarUploadErrorMessage(error)).toBe(
      "We couldn't upload your avatar. Please try again. If it still fails, contact support.",
    )
  },
)
