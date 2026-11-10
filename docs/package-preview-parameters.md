# Package preview parameters

Add a published package name to `src/lib/datasheet-reference-design-packages.ts`. The site matches datasheets to component manufacturer part numbers from the package's completed build. Static packages use their normal preview files.

For parameter controls, the package's postbuild publishes:

- `dist/props.schema.json`: the canonical JSON Schema used to validate the circuit's props.
- `dist/preview.json`: a version-2 manifest with `propsSchemaPath`, `componentPartNumbers`, `bundlePath` and `variants`. Each variant maps exact prop values to `circuitJsonPath` and `glbPath` in that release.
- A gzip Circuit JSON bundle keyed by each variant's `circuitJsonPath`, the individual Circuit JSON and SVG files, and the referenced GLBs.

`componentPartNumbers` comes from the generated circuits. Controls, defaults and supported choices come from the schema; the manifest does not duplicate their definitions. Version-1 manifests remain readable for older releases.

Supported schemas describe flat scalar properties with defaults: booleans become toggles, finite numeric enums or bounded numeric steps become sliders, and other enums become selects. Numbers require finite bounds and `multipleOf`; integers default to step 1. Quantity strings such as `8MHz` retain their original prop values. Titles are optional; labels otherwise come from property names. `x-unit` can supply units for numbers and ambiguous quantities such as `10k`. Constants and read-only defaults have no control. Local nonrecursive `$ref` is supported.

```ts
export const propsJsonSchema = {
  type: "object",
  properties: {
    telemetry: { type: "boolean", default: false },
    gain: { type: "integer", minimum: 1, maximum: 8, default: 2 },
    clock: { type: "string", enum: ["8MHz", "16MHz"], default: "8MHz" },
  },
} as const
```

This schema supplies one toggle, two sliders and 32 combinations without a website change. Package authors choose electrically valid domains; the site does not infer those limits from component code.

The postbuild belongs to the package. [The published reference package](https://tscircuit.com/ShiboSoftwareDev/cc2340r5-reference-design) contains an example in `scripts/shared/build-preview.ts`. It uses the released CLI to build native layouts and verifies geometry, connectivity and circuit checks before reusing layouts between value combinations. No CLI patch or API migration is needed.

The site prepares the bundle and referenced models before enabling controls. It then switches configurations across views and exports from memory. Current limits are 16 properties, 128 choices per property, 256 complete combinations and a 64 MiB decoded circuit bundle. Nested props, conditional domains and unbounded values are unsupported.

Run the hosted checks with `TSCIRCUIT_LIVE_URL=<deployment> bunx playwright test --config=playwright.live.config.ts`. `TSCIRCUIT_PARAMETER_RELEASE` optionally selects a different published demo release.
