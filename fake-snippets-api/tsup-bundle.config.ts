import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["dist/bundle.js"],
  format: ["esm"],
  noExternal: ["mime-types", "mime-db"],
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
  esbuildOptions(options) {
    options.allowOverwrite = true
  },
})
