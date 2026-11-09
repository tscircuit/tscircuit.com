# Datasheet reference designs

The existing `/datasheets/:chipName` page requests published reference designs
from `/datasheet_reference_designs/list`. It shows one configuration selector and
the shared RunFrame PCB, schematic, and 3D views. Changing configuration downloads
its Circuit JSON and GLB. Both hashes must match the manifest before rendering.
No circuit compilation or autorouting runs in the page.

The RunFrame dependency is pinned to the package published by
[RunFrame PR #6185](https://github.com/tscircuit/runframe/pull/6185), commit
`3f9690f9dd1091a7891978a63997cc322306ab14`.

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
