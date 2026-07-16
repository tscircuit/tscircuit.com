import { describe, expect, test } from "bun:test"
import {
  injectPackagePageContent,
  parsePackagePageRoute,
  renderPackagePageContent,
  serializeForInlineScript,
} from "../server/package-page-ssr.js"

describe("parsePackagePageRoute", () => {
  test.each([
    ["/alice/board", "package"],
    ["/alice/board/tree/src/components", "directory"],
    ["/alice/board/blob/src/index.tsx", "file"],
    ["/alice/board/releases", "releases"],
    ["/alice/board/releases/v1.2.3", "release"],
    ["/alice/board/releases/v1.2.3/preview", "preview"],
    ["/alice/board/releases/v1.2.3/builds", "builds"],
    ["/alice/board/releases/v1.2.3/builds/build-1", "build"],
    ["/alice/board/settings", "settings"],
    ["/view-package/alice/board", "package"],
  ])("recognizes %s as a %s page", (url, kind) => {
    expect(parsePackagePageRoute(url)?.kind).toBe(kind)
  })

  test("decodes file paths and preserves the selected version", () => {
    expect(
      parsePackagePageRoute(
        "/alice/board/blob/docs/USB%20C%20%231.md?version=1.2.3",
      ),
    ).toMatchObject({
      author: "alice",
      packageName: "board",
      kind: "file",
      filePath: "docs/USB C #1.md",
      version: "1.2.3",
    })
  })

  test("does not treat application and organization routes as packages", () => {
    expect(parsePackagePageRoute("/datasheets/LM555")).toBeNull()
    expect(parsePackagePageRoute("/orgs/invite")).toBeNull()
    expect(parsePackagePageRoute("/alice/settings")).toBeNull()
  })
})

const baseData = {
  route: {
    author: "alice",
    packageName: "board",
    packageNameWithScope: "alice/board",
    kind: "package",
    version: null,
  },
  packageInfo: {
    name: "alice/board",
    description: "A useful board",
    ai_usage_instructions: "Import the Board component.",
    latest_version: "1.0.0",
  },
  packageRelease: {
    package_release_id: "release-1",
    version: "1.0.0",
  },
  packageFiles: [
    { package_file_id: "file-1", file_path: "README.md" },
    { package_file_id: "file-2", file_path: "src/index.tsx" },
  ],
  primaryFile: {
    package_file_id: "file-1",
    file_path: "README.md",
    content_text: "# Board\nUse <Board />",
  },
  packageReleases: [],
  packageBuilds: [],
  packageBuild: null,
}

describe("renderPackagePageContent", () => {
  test("renders package metadata, files, and README content", () => {
    const html = renderPackagePageContent(baseData)

    expect(html).toContain("alice/board")
    expect(html).toContain("A useful board")
    expect(html).toContain("src")
    expect(html).toContain("# Board")
    expect(html).toContain("Use &lt;Board /&gt;")
  })

  test("renders the selected file content without allowing HTML injection", () => {
    const html = renderPackagePageContent({
      ...baseData,
      route: {
        ...baseData.route,
        kind: "file",
        filePath: "src/index.tsx",
      },
      primaryFile: {
        file_path: "src/index.tsx",
        content_text: '<script>alert("nope")</script>',
      },
    })

    expect(html).toContain("src/index.tsx")
    expect(html).toContain(
      "&lt;script&gt;alert(&quot;nope&quot;)&lt;/script&gt;",
    )
    expect(html).not.toContain('<script>alert("nope")</script>')
  })

  test("renders PCB and schematic previews above selected file content", () => {
    const html = renderPackagePageContent({
      ...baseData,
      route: {
        ...baseData.route,
        kind: "file",
        filePath: "src/index.tsx",
      },
      primaryFile: {
        file_path: "src/index.tsx",
        content_text: "export const Board = () => <board />",
      },
      fileArtifacts: {
        pcbSvg: null,
        schematicSvg: null,
        circuitJson: {
          file_path: "dist/src/index/circuit.json",
          content_text: "[]",
        },
      },
    })

    expect(html).toContain('aria-label="Circuit preview type"')
    expect(html).toContain('href="#ssr-pcb-preview">PCB</a>')
    expect(html).toContain('href="#ssr-schematic-preview">Schematic</a>')
    expect(html).toContain('src="data:image/svg+xml;base64,')
    expect(html.indexOf("ssr-file-preview")).toBeLessThan(
      html.indexOf("export const Board"),
    )
  })

  test("loads an explicit SVG artifact from an external image source", () => {
    const svg = '<svg><script>alert("nope")</script></svg>'
    const html = renderPackagePageContent({
      ...baseData,
      route: {
        ...baseData.route,
        kind: "file",
        filePath: "src/index.tsx",
      },
      fileArtifacts: {
        pcbSvg: {
          package_file_id: "pcb-file-1",
          file_path: "src/pcb.svg",
          content_text: svg,
        },
        schematicSvg: null,
        circuitJson: null,
      },
    })

    expect(html).toContain("PCB preview for src/index.tsx")
    expect(html).toContain('src="/package-file-images/pcb-file-1.svg"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('decoding="async"')
    expect(html).not.toContain(Buffer.from(svg).toString("base64"))
    expect(html).not.toContain('<script>alert("nope")</script>')
  })

  test("renders release and build lists", () => {
    const releasesHtml = renderPackagePageContent({
      ...baseData,
      route: { ...baseData.route, kind: "releases" },
      packageReleases: [
        {
          package_release_id: "release-2",
          version: "2.0.0",
          status: "success",
        },
      ],
    })
    const buildsHtml = renderPackagePageContent({
      ...baseData,
      route: {
        ...baseData.route,
        kind: "builds",
        releaseId: "release-1",
      },
      packageBuilds: [{ package_build_id: "build-1", status: "success" }],
    })

    expect(releasesHtml).toContain("2.0.0")
    expect(releasesHtml).toContain("success")
    expect(buildsHtml).toContain("build-1")
  })
})

test("injectPackagePageContent replaces the empty SPA root", () => {
  const html = injectPackagePageContent(
    '<body><div id="root" class="loaderanimation"></div></body>',
    "<main>Rendered package</main>",
  )

  expect(html).toContain(
    '<div id="root" data-server-rendered="true"><style>html.js #root > [data-ssr-package-page]{display:none}</style><main>Rendered package</main></div>',
  )
})

test("keeps server-rendered package content behind the loading state", () => {
  const html = injectPackagePageContent(
    '<html class="js"><body><div id="loader"></div><div id="root"></div></body></html>',
    '<main data-ssr-package-page="package">Rendered package</main>',
  )

  expect(html).toContain(
    "html.js #root > [data-ssr-package-page]{display:none}",
  )
  expect(html).not.toContain("#loader{display:none}")
})

test("serializeForInlineScript prevents closing the script element", () => {
  const serialized = serializeForInlineScript({ value: "</script><script>" })
  expect(serialized).not.toContain("</script>")
  expect(serialized).toContain("\\u003c/script\\u003e")
})
