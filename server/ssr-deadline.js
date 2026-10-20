export const PACKAGE_SSR_DEADLINE_MS = 4_000

export class SsrDeadlineError extends Error {
  constructor() {
    super("Package page SSR deadline exceeded")
    this.name = "SsrDeadlineError"
  }
}

// Race the whole operation, not each request. Abort upstream work as well;
// the race guarantees a fallback even if a fetch ignores cancellation.
export async function withSsrDeadline(
  work,
  timeoutMs = PACKAGE_SSR_DEADLINE_MS,
) {
  const controller = new AbortController()
  let timer
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new SsrDeadlineError()
      reject(error)
      controller.abort(error)
    }, timeoutMs)
  })

  try {
    return await Promise.race([work(controller.signal), deadline])
  } finally {
    clearTimeout(timer)
    // Also cancel speculative related-package requests on successful SSR.
    controller.abort()
  }
}
