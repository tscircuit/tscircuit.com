import { expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import MarkdownViewer from "@/components/ViewPackagePage/components/markdown-viewer"
import { resolveMarkdownImageUrl } from "@/lib/resolve-markdown-image-url"

// Actual broken README: https://tscircuit.com/rushabhcodes/ESP32-E-Reader
const context = {
  packageReleaseId: "5d57413b-2fb5-43cf-ab45-b052615b6834",
  filePath: "README.md",
  apiBaseUrl: "https://registry.example",
}

for (const [filePath, src, expected] of [
  [
    "README.md",
    "assets/enclosure/printable-front.png",
    "assets/enclosure/printable-front.png",
  ],
  [
    "README.md",
    "__snapshots__/index.circuit-pcb.snap.svg",
    "__snapshots__/index.circuit-pcb.snap.svg",
  ],
  ["docs/README.md", "./images/board.jpg", "docs/images/board.jpg"],
  ["docs/setup/README.md", "../../assets/board.png", "assets/board.png"],
  ["docs/README.md", "/assets/board.png", "assets/board.png"],
  [
    "docs/README.md",
    "../assets/pin%20map%23top.svg?raw=true#front",
    "assets/pin map#top.svg",
  ],
]) {
  test(`resolves ${src} from ${filePath} within the selected release`, () => {
    const result = new URL(
      resolveMarkdownImageUrl(src, { ...context, filePath })!,
    )
    expect(result.origin).toBe("https://registry.example")
    expect(result.pathname).toBe("/package_files/download")
    expect(result.searchParams.get("package_release_id")).toBe(
      context.packageReleaseId,
    )
    expect(result.searchParams.get("file_path")).toBe(expected)
    expect(result.hash).toBe(src.includes("#front") ? "#front" : "")
  })
}

test("keeps external images and Markdown without package context unchanged", () => {
  for (const src of [
    "https://images.example/board.png?size=2",
    "//images.example/board.svg",
    "#front",
    undefined,
    "",
  ]) {
    expect(resolveMarkdownImageUrl(src, context)).toBe(src)
  }
  expect(
    resolveMarkdownImageUrl("assets/board.png", { apiBaseUrl: "/api" }),
  ).toBe("assets/board.png")
})

test("renders real-board Markdown images through the configured API and selected version", () => {
  const markdown =
    "![Front of the dimensioned e-reader print prototype](assets/enclosure/printable-front.png)"
  for (const packageReleaseId of [context.packageReleaseId, "older-release"]) {
    const html = renderToStaticMarkup(
      <MarkdownViewer
        markdownContent={markdown}
        packageReleaseId={packageReleaseId}
        filePath="README.md"
      />,
    )
    expect(html).toContain(
      `src="/api/package_files/download?package_release_id=${packageReleaseId}&amp;file_path=assets%2Fenclosure%2Fprintable-front.png"`,
    )
    expect(html).toContain(
      'alt="Front of the dimensioned e-reader print prototype"',
    )
  }
})

test("retains React Markdown's unsafe-URL filtering", () => {
  const html = renderToStaticMarkup(
    <MarkdownViewer
      markdownContent="![unsafe](javascript:alert%281%29)"
      packageReleaseId={context.packageReleaseId}
    />,
  )
  expect(html).not.toContain("javascript:")
  expect(html).not.toContain("/package_files/download")
})
