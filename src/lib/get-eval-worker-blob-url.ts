import workerEntrypointUrl from "@tscircuit/eval/dist/webworker/entrypoint.js?url"

let cachedBlobUrl: string | undefined

const workerSource = `
const g = typeof globalThis !== "undefined"
  ? globalThis
  : typeof self !== "undefined"
    ? self
    : undefined;
if (g && !g.process) {
  const stdout = {
    write() {},
    columns: 80,
    isTTY: false,
  };
  const stderr = {
    write() {},
    columns: 80,
    isTTY: false,
  };
  const shim = {
    env: {},
    argv: [],
    browser: true,
    platform: "browser",
    cwd: () => "/",
    nextTick: (cb, ...args) => {
      if (typeof queueMicrotask === "function") {
        queueMicrotask(() => cb(...args));
      } else {
        Promise.resolve().then(() => cb(...args));
      }
    },
    hrtime: () => [0, 0],
    uptime: () => 0,
    stdout,
    stderr,
    on: () => {},
    off: () => {},
    addListener: () => {},
    removeListener: () => {},
    emit: () => false,
  };
  g.process = shim;
} else if (g && !g.process.env) {
  g.process.env = {};
}

(async () => {
  await import(${JSON.stringify(workerEntrypointUrl)});
})();
`

export const getEvalWorkerBlobUrl = (): string | undefined => {
  if (typeof window === "undefined") {
    return undefined
  }

  if (cachedBlobUrl) {
    return cachedBlobUrl
  }

  const blob = new Blob([workerSource], { type: "application/javascript" })
  cachedBlobUrl = URL.createObjectURL(blob)

  return cachedBlobUrl
}
