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

  test.each(["release", "build"])(
    "renders build logs in the %s page body without JavaScript",
    (kind) => {
      const html = renderPackagePageContent({
        ...baseData,
        route: {
          ...baseData.route,
          kind,
          releaseId: "release-1",
          buildId: "build-1",
        },
        packageBuild: {
          package_build_id: "build-1",
          user_code_job_started_at: "2026-09-03T14:15:35.301Z",
          user_code_job_completed_at: "2026-09-03T14:16:35.301Z",
          user_code_job_completed_logs: [
            {
              timestamp: "2026-09-03T14:15:41.583Z",
              msg: "Starting execution",
            },
            {
              timestamp: "2026-09-03T14:15:55.294Z",
              stream: "stderr",
              msg: 'Build <board />\n<script>alert("nope")</script> & done',
            },
            "Plain text log",
            { action: "execution_complete", exitCode: 0 },
          ],
        },
      })

      expect(html).toContain("<h2>Build Logs</h2>")
      expect(html).toContain("Status: Ready")
      expect(html).toContain(
        "<dt>Started</dt><dd>2026-09-03T14:15:35.301Z</dd>",
      )
      expect(html).toContain(
        "<dt>Completed</dt><dd>2026-09-03T14:16:35.301Z</dd>",
      )
      expect(html).toContain(
        "<pre><code>2026-09-03T14:15:41.583Z Starting execution\n2026-09-03T14:15:55.294Z Build &lt;board /&gt;\n&lt;script&gt;alert(&quot;nope&quot;)&lt;/script&gt; &amp; done\nPlain text log\n{&quot;action&quot;:&quot;execution_complete&quot;,&quot;exitCode&quot;:0}</code></pre>",
      )
      expect(html).not.toContain("<script>")
    },
  )

  test.each([
    "Build failed <details>",
    { message: "Build failed <details>" },
    { code: "BUILD_FAILED" },
  ])("renders build errors even when logs are absent: %j", (error) => {
    const html = renderPackagePageContent({
      ...baseData,
      route: { ...baseData.route, kind: "release", releaseId: "release-1" },
      packageBuild: {
        package_build_id: "build-1",
        build_in_progress: true,
        user_code_job_error: error,
        user_code_job_completed_logs: null,
      },
    })

    expect(html).toContain("Status: Failed")
    expect(html).toContain("<strong>Error:</strong>")
    expect(html).toContain(
      typeof error === "string" || error.message
        ? "Build failed &lt;details&gt;"
        : "{&quot;code&quot;:&quot;BUILD_FAILED&quot;}",
    )
    expect(html).toContain("No logs available.")
    expect(html).not.toContain("Build in progress.")
  })

  test("renders the available log snapshot for an active build", () => {
    const html = renderPackagePageContent({
      ...baseData,
      route: { ...baseData.route, kind: "build", buildId: "build-1" },
      packageBuild: {
        package_build_id: "build-1",
        user_code_job_started_at: "2026-09-03T14:15:35.301Z",
        user_code_job_completed_logs: [{ msg: "Autorouting phase 2" }],
      },
    })

    expect(html).toContain("Status: Building")
    expect(html).toContain("<pre><code>Autorouting phase 2</code></pre>")
    expect(html).toContain("Refresh this page for updated logs.")
  })

  test("renders queued builds and releases without builds", () => {
    const data = {
      ...baseData,
      route: { ...baseData.route, kind: "release", releaseId: "release-1" },
    }
    const queuedHtml = renderPackagePageContent({
      ...data,
      packageBuild: { package_build_id: "build-1" },
    })

    expect(queuedHtml).toContain("Status: Queued")
    expect(queuedHtml).toContain("No logs available.")
    expect(renderPackagePageContent(data)).toContain("No build available.")
  })
})

test("injectPackagePageContent replaces the empty SPA root", () => {
  const html = injectPackagePageContent(
    '<body><div id="root" class="loaderanimation"></div></body>',
    "<main>Rendered package</main>",
  )

  expect(html).toContain(
    '<div id="root" data-server-rendered="true"><main>Rendered package</main></div>',
  )
})

test("serializeForInlineScript prevents closing the script element", () => {
  const serialized = serializeForInlineScript({ value: "</script><script>" })
  expect(serialized).not.toContain("</script>")
  expect(serialized).toContain("\\u003c/script\\u003e")
})

test("injectPackagePageContent preserves dollar patterns in build logs", () => {
  const content = renderPackagePageContent({
    ...baseData,
    route: { ...baseData.route, kind: "build", buildId: "build-1" },
    packageBuild: {
      package_build_id: "build-1",
      user_code_job_completed_logs: [{ msg: "Patterns: $& $$ $` $'" }],
    },
  })
  const html = injectPackagePageContent(
    '<body><div id="root"></div></body>',
    content,
  )

  expect(html).toContain("Patterns: $&amp; $$ $` $&#39;")
  expect(html).toContain(content)
})
