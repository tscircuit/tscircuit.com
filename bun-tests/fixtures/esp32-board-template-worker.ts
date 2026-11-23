// Use the browser worker's bundled WASM in Bun.
Object.defineProperty(process, "type", { value: "renderer" })
require(
  Bun.fileURLToPath(import.meta.resolve("@tscircuit/eval/worker-entrypoint")),
)
