import { expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { Route, Router } from "wouter"
import MarkdownViewer from "@/components/ViewPackagePage/components/markdown-viewer"
import { resolvePackageMarkdownLink } from "@/lib/package-file-routes"

const context = {
  author: "rushabhcodes",
  packageName: "ESP32-E-Reader",
  packageReleaseId: "aa0d8b5f-dd6a-489b-88c4-8fb9dd3df5fb",
  filePath: "README.md",
}

test("the real e-reader README opens ORDERING.md in the same package release", () => {
  const html = renderToStaticMarkup(
    <Router ssrPath="/rushabhcodes/ESP32-E-Reader">
      <Route path="/:author/:packageName">
        <MarkdownViewer
          markdownContent="[the ordering gate](ORDERING.md)"
          packageReleaseId={context.packageReleaseId}
          filePath="README.md"
        />
      </Route>
    </Router>,
  )
  expect(html).toContain(
    `href="/rushabhcodes/ESP32-E-Reader/blob/ORDERING.md?package_release_id=${context.packageReleaseId}"`,
  )
})

test("nested Markdown links resolve files and directories from their own folder", () => {
  expect(
    resolvePackageMarkdownLink("../USB%20C%20%231.md#setup", {
      ...context,
      filePath: "docs/setup/README.md",
    }),
  ).toBe(
    `/rushabhcodes/ESP32-E-Reader/blob/docs/USB%20C%20%231.md?package_release_id=${context.packageReleaseId}#setup`,
  )
  expect(
    resolvePackageMarkdownLink("./print/", {
      ...context,
      filePath: "assets/enclosure/PRINTING.md",
    }),
  ).toBe(
    `/rushabhcodes/ESP32-E-Reader/tree/assets/enclosure/print?package_release_id=${context.packageReleaseId}`,
  )
})

test("keeps external links, site routes, anchors and Markdown without package context", () => {
  for (const href of [
    "https://example.com",
    "//example.com",
    "mailto:hello@example.com",
    "/dashboard",
    "#setup",
  ]) {
    expect(resolvePackageMarkdownLink(href, context)).toBe(href)
  }
  expect(resolvePackageMarkdownLink("ORDERING.md", {})).toBe("ORDERING.md")
})
