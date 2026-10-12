import { expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import MarkdownViewer from "@/components/ViewPackagePage/components/markdown-viewer"
import { resolveMarkdownImageUrl } from "@/lib/resolve-markdown-image-url"

test("loads the ESP32-E-Reader README image from its package release", () => {
  // https://tscircuit.com/rushabhcodes/ESP32-E-Reader
  const html = renderToStaticMarkup(
    <MarkdownViewer
      markdownContent="![Front of the dimensioned e-reader print prototype](assets/enclosure/printable-front.png)"
      packageReleaseId="5d57413b-2fb5-43cf-ab45-b052615b6834"
      filePath="README.md"
    />,
  )

  expect(html).toContain(
    'src="/api/package_files/download?package_release_id=5d57413b-2fb5-43cf-ab45-b052615b6834&amp;file_path=assets%2Fenclosure%2Fprintable-front.png"',
  )
})

test("resolves images relative to a nested Markdown file", () => {
  expect(
    resolveMarkdownImageUrl("./images/board.png", {
      packageReleaseId: "release-1",
      filePath: "docs/README.md",
      apiBaseUrl: "https://api.tscircuit.com",
    }),
  ).toBe(
    "https://api.tscircuit.com/package_files/download?package_release_id=release-1&file_path=docs%2Fimages%2Fboard.png",
  )
})

test("preserves external image URLs", () => {
  const html = renderToStaticMarkup(
    <MarkdownViewer
      markdownContent="![Board](https://example.com/board.png)"
      packageReleaseId="release-1"
      filePath="README.md"
    />,
  )

  expect(html).toContain('src="https://example.com/board.png"')
})
