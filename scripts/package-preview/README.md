# Schema-driven package previews

The site catalog contains only registry package names in `src/lib/datasheet-reference-design-packages.ts`. It matches datasheets to component manufacturer part numbers from each completed build. Static packages work too; they keep the normal build selector.

For independent parameter controls, a package must publish its valid props domain. The website cannot infer electrical limits from arbitrary component code.

1. Export a default circuit component and `propsJsonSchema` from the package's `mainEntrypoint`. Validate the component's props against that same schema, including its defaults. Do not maintain a separate controls list.
2. Copy `build-preview.ts` and `package-props-schema.ts` into the package's scripts directory. The schema helper is identical to `src/lib/package-props-schema.ts`, which the frontend uses.
3. Run the released CLI build with `--disable-parts-engine --glbs`, then call `await buildPackagePreview({ root: projectRoot })` in the package's postbuild. It uses the existing `--inject-props-file` flag. No CLI patch or new workflow is required. Dependencies: Bun, React, tscircuit, @tscircuit/cli, circuit-to-svg.
4. Run the package's circuit-specific checks and `tsci push`. After its registry build completes, add its package name to the site catalog.

The shared generator has no circuit field names or physical-layout grouping rules. It enumerates schema values, discovers physical layouts by geometry and source-port connectivity, builds each with the native CLI, and refuses reuse unless the fingerprints match. It publishes exact Circuit JSON and SVGs for each state, shared GLBs, a compressed circuit bundle, the canonical `dist/props.schema.json`, and a version-2 `dist/preview.json` referencing those artifacts. Component part numbers are collected from the generated circuits.

Supported JSON Schema domains are flat scalar properties with valid defaults: booleans, finite enums, or bounded numbers with `multipleOf` (integers default to step 1). Local nonrecursive `$ref`, constants and read-only defaults are supported. Booleans become toggles, numeric values and engineering quantities become stepped sliders, other enums become selects. Titles are optional; labels otherwise come from property names. Optional `x-unit` metadata disambiguates units for numeric values and strings such as `10k`. Original prop values are preserved.

Example (unrelated to the demo circuit):

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

This generates one toggle, two sliders and 32 exact states. The website fetches this schema from the selected package build; changing or adding properties needs no UI change. Version-1 preview manifests remain readable for previously published releases.

The current implementation prepares a finite set of states before enabling controls, so configuration switches need no downloads. Bounds are explicit: 16 properties, 128 choices per property and 256 total combinations, plus a 64 MiB decoded bundle limit in the frontend. Nested props, conditional domains, continuous/unbounded values and runtime circuit compilation need a different rendering strategy. This helper supports a TSX main entrypoint and expects a native default build first.
