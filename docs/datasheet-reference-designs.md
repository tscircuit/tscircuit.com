# Datasheet reference designs

The existing `/datasheets/:chipName` page requests published reference designs
from `/datasheet_reference_designs/list`. It shows one configuration selector and
the shared RunFrame PCB, schematic, and 3D views. Changing configuration downloads
its Circuit JSON and GLB. Both hashes must match the manifest before rendering.
No circuit compilation or autorouting runs in the page.

The RunFrame dependency is pinned to the package published by
[RunFrame PR #6185](https://github.com/tscircuit/runframe/pull/6185), commit
`dd4e6cebe30034d8d092e829e6ca483488e2aaf5`.

For the complete local integration, use the branches in
[CLI PR #5742](https://github.com/tscircuit/cli/pull/5742) and
[API PR #1230](https://github.com/tscircuit/api.tscircuit.com/pull/1230):

1. Build `examples/reference-designs/ne555-timer` with the CLI branch.
2. Start the API branch's `tests/fixtures/start-reference-design-preview.ts`
   with the built package directory as its argument and `NODE_ENV=test`.
3. In this branch, run `SNIPPETS_API_URL=<printed API URL> bunx vite --port 5177`.
4. Open `/datasheets/NE555DR`. Select Full board, Slow pulse, or Without LED.
   The selected view stays active while the prebuilt configuration changes.

Append `?reference_design_release_id=<printed release ID>` to pin the reference
design release. The normal page uses the API's latest successful release selection.
Datasheets without published designs have no reference-design section.

The API fixture uses actual package upload, datasheet, discovery, and download
routes with an isolated in-memory database. Production credentials are unnecessary.

## Hosted PR preview

Open `/datasheets/NE555DR` on the website PR's
Vercel preview to use the CLI-built sample independently of the API deployment.
It also loads when navigating from the datasheet search results or reloading the
page. The earlier `reference_design_preview` query parameter is unnecessary.
The existing datasheet still loads normally. Reference-design discovery uses a
static sample, and the normal viewer verifies the Circuit JSON and GLB hashes.

The compressed fixture in `playwright-tests/fixtures/ne555-reference-design.json.gz`
records its source URL and CLI commit. It contains the three actual builds from
CLI commit `e45cc4c`, their manifest, and a static discovery response. The Vite
plugin emits these files only for Vercel Preview builds, or local development
with `REFERENCE_DESIGN_PREVIEW=true`. Production builds disable the sample and
exclude its files. This is a UI preview; the API integration is tested separately
through the real-route local fixture above.
