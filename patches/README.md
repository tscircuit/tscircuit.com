The `@tscircuit/3d-viewer@0.0.650` patch backports the on-demand explosion
callback and initial-open option from:
https://github.com/tscircuit/3d-viewer/pull/1136

After upgrading to a viewer release containing that PR, remove the corresponding
`patchedDependencies` entry and patch file, regenerate `bun.lock`, and run
`playwright-tests/package-glb-preview.spec.ts`.
