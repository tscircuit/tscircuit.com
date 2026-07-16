// Shared by the production request handler and the local Vite SSR middleware.
import {
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"

const RESERVED_TOP_LEVEL_ROUTES = new Set([
  "api",
  "authorize",
  "cli-login",
  "dashboard",
  "datasheets",
  "dev-login",
  "editor",
  "landing",
  "latest",
  "legacy-editor",
  "login",
  "my-orders",
  "orders",
  "org-login",
  "orgs",
  "playground",
  "quickstart",
  "search",
  "settings",
  "trending",
])

const decodePathPart = (part) => {
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

const encodePath = (path) =>
  path.split("/").filter(Boolean).map(encodeURIComponent).join("/")

export function parsePackagePageRoute(requestUrl) {
  const url = new URL(requestUrl, "https://tscircuit.com")
  const parts = url.pathname.split("/").filter(Boolean)
  let isLegacyRoute = false

  if (parts[0] === "view-package") {
    parts.shift()
    isLegacyRoute = true
  }

  if (parts.length < 2 || RESERVED_TOP_LEVEL_ROUTES.has(parts[0])) return null

  const [author, packageName, ...rest] = parts.map(decodePathPart)
  if (packageName === "settings") return null
  const baseRoute = {
    author,
    packageName,
    packageNameWithScope: `${author}/${packageName}`,
    version: url.searchParams.get("version"),
    isLegacyRoute,
  }

  if (rest.length === 0) return { ...baseRoute, kind: "package" }

  if (rest[0] === "tree") {
    return {
      ...baseRoute,
      kind: "directory",
      filePath: rest.slice(1).join("/"),
    }
  }

  if (rest[0] === "blob" && rest.length > 1) {
    return {
      ...baseRoute,
      kind: "file",
      filePath: rest.slice(1).join("/"),
    }
  }

  if (rest[0] === "settings" && rest.length === 1) {
    return { ...baseRoute, kind: "settings" }
  }

  if (rest[0] !== "releases") return null
  if (rest.length === 1) return { ...baseRoute, kind: "releases" }

  const releaseId = rest[1]
  if (rest.length === 2) {
    return { ...baseRoute, kind: "release", releaseId }
  }
  if (rest[2] === "preview" && rest.length === 3) {
    return { ...baseRoute, kind: "preview", releaseId }
  }
  if (rest[2] === "builds" && rest.length === 3) {
    return { ...baseRoute, kind: "builds", releaseId }
  }
  if (rest[2] === "builds" && rest.length === 4) {
    return {
      ...baseRoute,
      kind: "build",
      releaseId,
      buildId: rest[3],
    }
  }

  return null
}

const formatDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString()
}

const getReleaseLabel = (release) =>
  release?.version || release?.package_release_id || "Unknown release"

const getStatus = (record) =>
  record?.status ||
  record?.build_status ||
  record?.deployment_status ||
  (record?.is_latest ? "latest" : null)

const renderDefinitionList = (entries) => {
  const visibleEntries = entries.filter(
    ([, value]) => value != null && value !== "",
  )
  if (visibleEntries.length === 0) return ""

  return `<dl>${visibleEntries
    .map(
      ([label, value]) =>
        `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
    )
    .join("")}</dl>`
}

const getDirectoryEntries = (packageFiles, directoryPath) => {
  const normalizedDirectory = directoryPath.replace(/^\/+|\/+$/g, "")
  const prefix = normalizedDirectory ? `${normalizedDirectory}/` : ""
  const entries = new Map()

  for (const file of packageFiles || []) {
    const normalizedPath = String(file.file_path || "").replace(/^\/+/, "")
    if (
      !normalizedPath.startsWith(prefix) ||
      normalizedPath === normalizedDirectory
    ) {
      continue
    }

    const relativePath = normalizedPath.slice(prefix.length)
    const [name, ...remainingParts] = relativePath.split("/")
    if (!name) continue

    const isDirectory = remainingParts.length > 0 || file.is_directory === true
    if (!entries.has(name) || isDirectory) {
      entries.set(name, {
        name,
        isDirectory,
        path: `${prefix}${name}`,
      })
    }
  }

  return Array.from(entries.values()).sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

const renderFileList = ({ route, packageFiles }) => {
  const directoryPath = route.kind === "directory" ? route.filePath : ""
  const entries = getDirectoryEntries(packageFiles, directoryPath)
  const basePath = `/${encodeURIComponent(route.author)}/${encodeURIComponent(
    route.packageName,
  )}`
  const versionSearch = route.version
    ? `?version=${encodeURIComponent(route.version)}`
    : ""

  if (entries.length === 0) {
    return "<p>No files were found in this directory.</p>"
  }

  return `<ul class="ssr-file-list">${entries
    .map((entry) => {
      const routeSegment = entry.isDirectory ? "tree" : "blob"
      const href = `${basePath}/${routeSegment}/${encodePath(entry.path)}${versionSearch}`
      return `<li><a href="${escapeHtml(href)}"><span aria-hidden="true">${
        entry.isDirectory ? "📁" : "📄"
      }</span> ${escapeHtml(entry.name)}</a></li>`
    })
    .join("")}</ul>`
}

const renderReleaseList = (route, packageReleases) => {
  if (!packageReleases?.length) return "<p>No releases have been published.</p>"
  const basePath = `/${encodeURIComponent(route.author)}/${encodeURIComponent(
    route.packageName,
  )}/releases`

  return `<ol class="ssr-release-list">${packageReleases
    .map((release) => {
      const releaseId = release.package_release_id || release.version
      return `<li><a href="${basePath}/${encodeURIComponent(
        releaseId,
      )}"><strong>${escapeHtml(getReleaseLabel(release))}</strong></a>${
        getStatus(release)
          ? ` <span>${escapeHtml(getStatus(release))}</span>`
          : ""
      }${
        release.created_at
          ? `<time datetime="${escapeHtml(formatDate(release.created_at))}">${escapeHtml(
              formatDate(release.created_at),
            )}</time>`
          : ""
      }</li>`
    })
    .join("")}</ol>`
}

const renderBuildList = (route, packageBuilds) => {
  if (!packageBuilds?.length)
    return "<p>No builds were found for this release.</p>"
  const basePath = `/${encodeURIComponent(route.author)}/${encodeURIComponent(
    route.packageName,
  )}/releases/${encodeURIComponent(route.releaseId)}/builds`

  return `<ol class="ssr-release-list">${packageBuilds
    .map(
      (build) =>
        `<li><a href="${basePath}/${encodeURIComponent(
          build.package_build_id,
        )}"><strong>${escapeHtml(build.package_build_id)}</strong></a>${
          getStatus(build)
            ? ` <span>${escapeHtml(getStatus(build))}</span>`
            : ""
        }${
          build.created_at
            ? `<time datetime="${escapeHtml(formatDate(build.created_at))}">${escapeHtml(
                formatDate(build.created_at),
              )}</time>`
            : ""
        }</li>`,
    )
    .join("")}</ol>`
}

const renderRelease = (packageRelease) =>
  renderDefinitionList([
    ["Version", packageRelease?.version],
    ["Release ID", packageRelease?.package_release_id],
    ["Status", getStatus(packageRelease)],
    ["Created", formatDate(packageRelease?.created_at)],
    ["Latest build", packageRelease?.latest_package_build_id],
  ])

const renderBuild = (packageBuild) =>
  renderDefinitionList([
    ["Build ID", packageBuild?.package_build_id],
    ["Status", getStatus(packageBuild)],
    ["Created", formatDate(packageBuild?.created_at)],
    ["Started", formatDate(packageBuild?.started_at)],
    ["Completed", formatDate(packageBuild?.completed_at)],
  ])

const convertCircuitJsonForPreview = (contentText, converter) => {
  if (!contentText) return null
  try {
    const circuitJson = JSON.parse(contentText)
    if (!Array.isArray(circuitJson)) return null
    return converter(circuitJson)
  } catch {
    return null
  }
}

const svgDataUrl = (svg) =>
  `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`

const getPackageFileImageUrl = (packageFile) => {
  if (!packageFile?.package_file_id) return null
  return `/package-file-images/${encodeURIComponent(
    packageFile.package_file_id,
  )}.svg`
}

const renderFileArtifactPreview = (route, fileArtifacts) => {
  if (!fileArtifacts) return ""

  const circuitJsonContent = fileArtifacts.circuitJson?.content_text
  const previews = [
    {
      kind: "pcb",
      label: "PCB",
      src:
        getPackageFileImageUrl(fileArtifacts.pcbSvg) ||
        (fileArtifacts.pcbSvg?.content_text
          ? svgDataUrl(fileArtifacts.pcbSvg.content_text)
          : null) ||
        (() => {
          const svg = convertCircuitJsonForPreview(
            circuitJsonContent,
            convertCircuitJsonToPcbSvg,
          )
          return svg ? svgDataUrl(svg) : null
        })(),
    },
    {
      kind: "schematic",
      label: "Schematic",
      src:
        getPackageFileImageUrl(fileArtifacts.schematicSvg) ||
        (fileArtifacts.schematicSvg?.content_text
          ? svgDataUrl(fileArtifacts.schematicSvg.content_text)
          : null) ||
        (() => {
          const svg = convertCircuitJsonForPreview(
            circuitJsonContent,
            convertCircuitJsonToSchematicSvg,
          )
          return svg ? svgDataUrl(svg) : null
        })(),
    },
  ].filter((preview) => preview.src)

  if (previews.length === 0) return ""

  const selector =
    previews.length > 1
      ? `<nav class="ssr-preview-selector" aria-label="Circuit preview type">${previews
          .map(
            (preview) =>
              `<a href="#ssr-${preview.kind}-preview">${preview.label}</a>`,
          )
          .join("")}</nav>`
      : ""

  return `<section class="ssr-file-preview" aria-label="Circuit preview">${selector}${previews
    .map(
      (preview, index) =>
        `<details id="ssr-${preview.kind}-preview" name="ssr-circuit-preview"${
          index === 0 ? " open" : ""
        }><summary>${preview.label}</summary><img src="${escapeHtml(
          preview.src,
        )}" loading="lazy" decoding="async" alt="${escapeHtml(
          preview.label,
        )} preview for ${escapeHtml(route.filePath)}"></details>`,
    )
    .join("")}</section>`
}

const renderRouteContent = ({
  route,
  packageRelease,
  packageFiles,
  primaryFile,
  fileArtifacts,
  packageReleases,
  packageBuilds,
  packageBuild,
}) => {
  if (route.kind === "file") {
    return `<section><h2>${escapeHtml(route.filePath)}</h2>${renderFileArtifactPreview(
      route,
      fileArtifacts,
    )}${
      primaryFile?.content_text == null
        ? "<p>A text preview is not available for this file.</p>"
        : `<pre><code>${escapeHtml(primaryFile.content_text)}</code></pre>`
    }</section>`
  }

  if (route.kind === "directory") {
    return `<section><h2>Files in ${escapeHtml(
      route.filePath ? `(root)/${route.filePath}` : "(root)",
    )}</h2>${renderFileList({ route, packageFiles })}</section>`
  }

  if (route.kind === "releases") {
    return `<section><h2>Releases</h2>${renderReleaseList(
      route,
      packageReleases,
    )}</section>`
  }

  if (route.kind === "release" || route.kind === "preview") {
    return `<section><h2>${
      route.kind === "preview" ? "Release preview" : "Release"
    } ${escapeHtml(getReleaseLabel(packageRelease))}</h2>${renderRelease(
      packageRelease,
    )}${
      packageBuild ? `<h3>Latest build</h3>${renderBuild(packageBuild)}` : ""
    }</section>`
  }

  if (route.kind === "builds") {
    return `<section><h2>Builds for ${escapeHtml(
      getReleaseLabel(packageRelease),
    )}</h2>${renderRelease(packageRelease)}${renderBuildList(
      route,
      packageBuilds,
    )}</section>`
  }

  if (route.kind === "build") {
    return `<section><h2>Build ${escapeHtml(
      packageBuild?.package_build_id || route.buildId,
    )}</h2>${renderBuild(packageBuild)}</section>`
  }

  if (route.kind === "settings") {
    return "<section><h2>Package settings</h2><p>Sign in to manage this package.</p></section>"
  }

  return `<section><h2>Files</h2>${renderFileList({
    route,
    packageFiles,
  })}</section>${
    primaryFile?.content_text
      ? `<article><h2>${escapeHtml(
          primaryFile.file_path || "README.md",
        )}</h2><pre><code>${escapeHtml(primaryFile.content_text)}</code></pre></article>`
      : ""
  }`
}

export function renderPackagePageContent(data) {
  const { route, packageInfo, packageRelease } = data
  const packageDescription =
    packageInfo.description ||
    packageInfo.ai_description ||
    `A tscircuit package created by ${route.author}.`
  const packageUrl = `/${encodeURIComponent(route.author)}/${encodeURIComponent(
    route.packageName,
  )}`

  return `<style>.ssr-package-page{max-width:75rem;margin:0 auto;padding:2rem 1rem;font-family:ui-sans-serif,system-ui,sans-serif;color:#111827}.ssr-package-page nav{font-size:.875rem;margin-bottom:1rem}.ssr-package-page header{border-bottom:1px solid #e5e7eb;padding-bottom:1.5rem;margin-bottom:1.5rem}.ssr-package-page h1{font-size:2rem;margin:.25rem 0}.ssr-package-page h2{font-size:1.25rem;margin:1.5rem 0 .75rem}.ssr-package-page p{line-height:1.6}.ssr-package-page ul,.ssr-package-page ol{padding-left:1.5rem}.ssr-package-page li{margin:.5rem 0}.ssr-package-page a{color:#2563eb;text-decoration:none}.ssr-package-page a:hover{text-decoration:underline}.ssr-package-page pre{overflow:auto;padding:1rem;border:1px solid #e5e7eb;border-radius:.375rem;background:#f9fafb;white-space:pre-wrap}.ssr-package-page dl>div{display:grid;grid-template-columns:minmax(8rem,12rem) 1fr;padding:.5rem 0;border-bottom:1px solid #e5e7eb}.ssr-package-page dt{font-weight:600}.ssr-release-list time{display:block;color:#6b7280;font-size:.875rem}.ssr-file-preview{margin:1rem 0;padding:1rem;border:1px solid #e5e7eb;border-radius:.5rem;background:#f9fafb}.ssr-package-page .ssr-preview-selector{display:flex;gap:.5rem;margin-bottom:.75rem}.ssr-preview-selector a{padding:.375rem .75rem;border:1px solid #d1d5db;border-radius:.375rem;background:#fff}.ssr-file-preview details+details{margin-top:.75rem}.ssr-file-preview summary{cursor:pointer;font-weight:600}.ssr-file-preview img{display:block;width:100%;max-height:36rem;margin-top:.75rem;object-fit:contain;background:#fff;border:1px solid #e5e7eb;border-radius:.375rem}</style><main class="ssr-package-page" data-ssr-package-page="${escapeHtml(
    route.kind,
  )}"><nav><a href="/">tscircuit</a> / <a href="/${encodeURIComponent(
    route.author,
  )}">${escapeHtml(route.author)}</a> / <a href="${packageUrl}">${escapeHtml(
    route.packageName,
  )}</a></nav><header><h1>${escapeHtml(packageInfo.name)}</h1><p>${escapeHtml(
    packageDescription,
  )}</p>${
    packageInfo.ai_usage_instructions
      ? `<p><strong>Usage:</strong> ${escapeHtml(packageInfo.ai_usage_instructions)}</p>`
      : ""
  }${renderDefinitionList([
    ["Version", packageRelease?.version || packageInfo.latest_version],
    ["License", packageInfo.license],
    ["Stars", packageInfo.star_count],
  ])}</header>${renderRouteContent(data)}</main>`
}

export function injectPackagePageContent(html, ssrContent) {
  if (!ssrContent) return html
  return html.replace(
    /<div id="root"(?: class="[^"]*")?><\/div>/,
    `<div id="root" data-server-rendered="true"><style>html.js #root > [data-ssr-package-page]{display:none}</style>${ssrContent}</div>`,
  )
}

export function serializeForInlineScript(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029")
}
