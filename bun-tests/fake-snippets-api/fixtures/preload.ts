import { afterEach } from "bun:test"

declare global {
  // Add the property to the globalThis type
  // eslint-disable-next-line no-var
  var deferredCleanupFns: Array<() => Promise<void>>
}

if (!globalThis.deferredCleanupFns) {
  globalThis.deferredCleanupFns = []
}

afterEach(async () => {
  for (const fn of globalThis.deferredCleanupFns) {
    await fn()
  }
  globalThis.deferredCleanupFns = []
})
