import { expect, test } from "bun:test"
import { SsrDeadlineError, withSsrDeadline } from "../server/ssr-deadline.js"

test("one deadline covers sequential work and aborts all pending work", async () => {
  let signal
  const started = performance.now()
  await expect(
    withSsrDeadline(async (sharedSignal) => {
      signal = sharedSignal
      await new Promise((resolve) => setTimeout(resolve, 60))
      await new Promise((resolve) => setTimeout(resolve, 60))
    }, 100),
  ).rejects.toBeInstanceOf(SsrDeadlineError)
  expect(signal.aborted).toBe(true)
  expect(performance.now() - started).toBeLessThan(500)
})

test("returns even if upstream work ignores cancellation", async () => {
  await expect(
    withSsrDeadline(() => new Promise(() => {}), 20),
  ).rejects.toBeInstanceOf(SsrDeadlineError)
})

test("successful work returns its value and cancels speculative work", async () => {
  let signal
  expect(
    await withSsrDeadline(async (sharedSignal) => {
      signal = sharedSignal
      return "complete"
    }, 100),
  ).toBe("complete")
  expect(signal.aborted).toBe(true)
})

test("propagates errors and cancels upstream work", async () => {
  const error = new Error("registry failed")
  let signal
  await expect(
    withSsrDeadline(async (sharedSignal) => {
      signal = sharedSignal
      throw error
    }),
  ).rejects.toBe(error)
  expect(signal.aborted).toBe(true)
})
