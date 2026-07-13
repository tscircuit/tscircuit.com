// api/generated-index.js
import ky from "ky"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import he from "he"
import {
  injectPackagePageContent,
  parsePackagePageRoute,
  renderPackagePageContent,
  serializeForInlineScript,
} from "../server/package-page-ssr.js"
import { getPackageFileArtifactPaths } from "../server/package-file-artifacts.js"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const isDev =
  process.env.TSC_DEV_SSR === "true" || process.env.NODE_ENV === "development"
const normalIndexFile = isDev
  ? join(__dirname, "../index.html")
  : join(__dirname, "../dist/index.html")
let htmlContent = readFileSync(normalIndexFile, "utf-8")

export function setHtmlContent(html) {
  htmlContent = html
}

const BASE_URL = process.env.TSC_BASE_URL || "https://tscircuit.com"
const REGISTRY_URL = process.env.TSC_REGISTRY_API || "https://api.tscircuit.com"

export const cacheControlHeader = "public, max-age=0, must-revalidate"
const PREFETCHABLE_PAGES = new Set([
  "landing",
  "editor",
  "search",
  "trending",
  "dashboard",
  "latest",
  "settings",
  "quickstart",
  "releases",
])

const pageDescriptions = {
  landing:
    "Build electronics with code and AI tools. Render code into schematics, PCBs, 3D, fabrication files, and more. Open-source MIT licensed electronic design automation tool.",
  dashboard:
    "Your tscircuit dashboard - manage your electronic circuit packages, view trending and latest packages, and access your recent designs.",
  search:
    "Search and discover electronic circuit packages on tscircuit. Find components, circuits, and designs created by the community.",
  editor:
    "Design and edit electronic circuits online with tscircuit's powerful web-based editor. Create schematics, PCB layouts, and 3D models with code.",
  trending:
    "Discover the most popular and trending electronic circuit packages on tscircuit. Find top-rated components, keyboards, microcontrollers, connectors, and sensors.",
  latest:
    "Explore the newest electronic circuit packages on tscircuit. Discover fresh circuit designs, components, and innovative approaches to electronic design.",
  quickstart:
    "Get started quickly with tscircuit. Create new circuit packages, import components from JLCPCB, or start from templates to begin your electronic design journey.",
  settings:
    "Manage your tscircuit account settings, shipping information, and preferences for electronic design and PCB ordering.",
  releases: "View all package releases, access build information.",
}

function getPageDescription(pageName) {
  return pageDescriptions[pageName] || ""
}

function getHtmlWithModifiedSeoTags({
  title,
  description,
  canonicalUrl,
  imageUrl,
  ssrPackageData,
  ssrContent,
}) {
  const seoStartTag = "<!-- SEO_START -->"
  const seoEndTag = "<!-- SEO_END -->"
  const seoStartIndex = htmlContent.indexOf(seoStartTag)
  const seoEndIndex = htmlContent.indexOf(seoEndTag) + seoEndTag.length

  const seoTags = `
  <title>${title}</title>
  <meta name="description"
    content="${description}" />
  <meta name="keywords"
    content="electronic design, PCB design, schematic capture, React components, circuit design, electronics CAD, open source EDA, ${title}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description"
    content="${description}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ""}
  ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}" />` : ""}
  <link rel="canonical" href="${canonicalUrl}" />
  `

  // First replace SEO tags
  let modifiedHtml = `${htmlContent.substring(
    0,
    seoStartIndex,
  )}${seoTags}${htmlContent.substring(seoEndIndex)}`

  // Then handle SSR data injection
  if (ssrPackageData) {
    const ssrStartTag = "<!-- SSR_START -->"
    const ssrEndTag = "<!-- SSR_END -->"
    const {
      package: packageData,
      packageRelease,
      packageFiles,
      packageFile,
      packageFileArtifacts,
      packageReleases,
      packageBuilds,
      packageBuild,
      route,
    } = ssrPackageData

    const assignments = []
    if (packageData) {
      assignments.push(
        `window.SSR_PACKAGE = ${serializeForInlineScript(packageData)};`,
      )
    }
    if (packageRelease) {
      assignments.push(
        `window.SSR_PACKAGE_RELEASE = ${serializeForInlineScript(packageRelease)};`,
      )
    }
    if (packageFiles) {
      assignments.push(
        `window.SSR_PACKAGE_FILES = ${serializeForInlineScript(packageFiles)};`,
      )
    }
    if (packageFile) {
      assignments.push(
        `window.SSR_PACKAGE_FILE = ${serializeForInlineScript(packageFile)};`,
      )
    }
    if (packageFileArtifacts?.length) {
      assignments.push(
        `window.SSR_PACKAGE_FILE_ARTIFACTS = ${serializeForInlineScript(packageFileArtifacts)};`,
      )
    }
    if (packageReleases) {
      assignments.push(
        `window.SSR_PACKAGE_RELEASES = ${serializeForInlineScript(packageReleases)};`,
      )
    }
    if (packageBuilds) {
      assignments.push(
        `window.SSR_PACKAGE_BUILDS = ${serializeForInlineScript(packageBuilds)};`,
      )
    }
    if (packageBuild) {
      assignments.push(
        `window.SSR_PACKAGE_BUILD = ${serializeForInlineScript(packageBuild)};`,
      )
    }
    if (route) {
      assignments.push(
        `window.SSR_PACKAGE_ROUTE = ${serializeForInlineScript(route)};`,
      )
    }

    const ssrScripts =
      assignments.length > 0 ? `<script>${assignments.join(" ")}</script>` : ""

    if (ssrScripts) {
      const ssrContent = `\n  ${ssrScripts}\n  `
      modifiedHtml = modifiedHtml.replace(
        `${ssrStartTag}\n  ${ssrEndTag}`,
        `${ssrStartTag}${ssrContent}${ssrEndTag}`,
      )
    }
  }

  return injectPackagePageContent(modifiedHtml, ssrContent)
}

export async function handleUserProfile(req, res) {
  const username = req.url.split("/")[req.url.split("/").length - 1]

  if (!username) {
    throw new Error("Username not provided")
  }

  const description = he.encode(`Circuits created by ${username} on tscircuit`)

  const title = he.encode(`${username} - tscircuit`)

  const html = getHtmlWithModifiedSeoTags({
    title,
    description,
    canonicalUrl: `${BASE_URL}/${he.encode(username)}`,
    imageUrl: `https://github.com/${username}.png`,
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function handleDatasheetPage(req, res) {
  const parts = req.url.split("?")[0].split("/")
  if (parts[1] !== "datasheets" || !parts[2]) {
    throw new Error("Not a datasheet page")
  }
  const chipName = parts[2]

  const html = getHtmlWithModifiedSeoTags({
    title: `${chipName} Datasheet - tscircuit`,
    description: `View the ${chipName} datasheet on tscircuit.`,
    canonicalUrl: `${BASE_URL}/datasheets/${he.encode(chipName)}`,
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function requestJsonOrNull(request) {
  try {
    return await request.json()
  } catch (error) {
    if (error?.response?.status === 404 || String(error).includes("404")) {
      return null
    }
    throw error
  }
}

async function fetchPackageRelease(route) {
  const getRelease = async (query) => {
    const response = await requestJsonOrNull(
      ky.post(`${REGISTRY_URL}/package_releases/get`, {
        searchParams: {
          include_logs: true,
          include_ai_review: true,
        },
        json: query,
      }),
    )
    return response?.package_release ?? null
  }

  if (route.releaseId) {
    const releaseById = await getRelease({
      package_release_id: route.releaseId,
    })
    if (releaseById) return releaseById

    return getRelease({
      package_name_with_version: `${route.packageNameWithScope}@${route.releaseId}`,
    })
  }

  if (route.version) {
    return getRelease({
      package_name_with_version: `${route.packageNameWithScope}@${route.version}`,
    })
  }

  return getRelease({
    package_name: route.packageNameWithScope,
    is_latest: true,
  })
}

async function fetchPackagePageData(route, packageInfo) {
  const packageRelease = await fetchPackageRelease(route).catch((error) => {
    console.warn("Failed to fetch package release for SSR:", error)
    return null
  })

  const releasesResponse = await requestJsonOrNull(
    ky.post(`${REGISTRY_URL}/package_releases/list`, {
      json: { package_id: packageInfo.package_id },
    }),
  ).catch((error) => {
    console.warn("Failed to fetch package releases for SSR:", error)
    return null
  })
  const packageReleases = releasesResponse?.package_releases ?? []

  let packageFiles = []
  if (packageRelease?.package_release_id) {
    const filesResponse = await requestJsonOrNull(
      ky.get(`${REGISTRY_URL}/package_files/list`, {
        searchParams: {
          package_release_id: packageRelease.package_release_id,
        },
      }),
    ).catch((error) => {
      console.warn("Failed to fetch package files for SSR:", error)
      return null
    })
    packageFiles = filesResponse?.package_files ?? []
  }

  let primaryFile = null
  if (packageRelease?.package_release_id) {
    let primaryFileMetadata = null
    if (route.kind === "file") {
      primaryFileMetadata = packageFiles.find(
        (file) =>
          String(file.file_path || "").replace(/^\/+/, "") === route.filePath,
      )
    } else if (route.kind === "package") {
      primaryFileMetadata = packageFiles.find((file) =>
        ["readme.md", "readme"].includes(
          String(file.file_path || "")
            .replace(/^\/+/, "")
            .toLowerCase(),
        ),
      )
    }

    if (primaryFileMetadata || route.kind === "file") {
      const searchParams = primaryFileMetadata?.package_file_id
        ? { package_file_id: primaryFileMetadata.package_file_id }
        : {
            package_release_id: packageRelease.package_release_id,
            file_path: route.filePath,
          }
      const fileResponse = await requestJsonOrNull(
        ky.get(`${REGISTRY_URL}/package_files/get`, { searchParams }),
      ).catch((error) => {
        console.warn("Failed to fetch primary package file for SSR:", error)
        return null
      })
      primaryFile = fileResponse?.package_file ?? null
    }
  }

  let fileArtifacts = null
  if (route.kind === "file" && packageRelease?.package_release_id) {
    const artifactPaths = getPackageFileArtifactPaths(
      route.filePath,
      packageFiles,
    )
    const fetchArtifact = async (filePath) => {
      if (!filePath) return null
      if (
        primaryFile &&
        String(primaryFile.file_path || "").replace(/^\/+/, "") === filePath
      ) {
        return primaryFile
      }

      const metadata = packageFiles.find(
        (file) => String(file.file_path || "").replace(/^\/+/, "") === filePath,
      )
      const searchParams = metadata?.package_file_id
        ? { package_file_id: metadata.package_file_id }
        : {
            package_release_id: packageRelease.package_release_id,
            file_path: filePath,
          }
      const response = await requestJsonOrNull(
        ky.get(`${REGISTRY_URL}/package_files/get`, { searchParams }),
      ).catch((error) => {
        console.warn(`Failed to fetch ${filePath} for SSR:`, error)
        return null
      })
      return response?.package_file ?? null
    }

    const [pcbSvg, schematicSvg, circuitJson] = await Promise.all([
      fetchArtifact(artifactPaths.pcbSvgPath),
      fetchArtifact(artifactPaths.schematicSvgPath),
      fetchArtifact(artifactPaths.circuitJsonPath),
    ])
    fileArtifacts = { pcbSvg, schematicSvg, circuitJson }
  }

  let packageBuilds = []
  if (route.kind === "builds" && packageRelease?.package_release_id) {
    const buildsResponse = await requestJsonOrNull(
      ky.get(`${REGISTRY_URL}/package_builds/list`, {
        searchParams: {
          package_release_id: packageRelease.package_release_id,
        },
      }),
    ).catch((error) => {
      console.warn("Failed to fetch package builds for SSR:", error)
      return null
    })
    packageBuilds = buildsResponse?.package_builds ?? []
  }

  let packageBuild = null
  const buildId =
    route.kind === "build"
      ? route.buildId
      : route.kind === "release"
        ? packageRelease?.latest_package_build_id
        : null
  if (buildId) {
    const buildResponse = await requestJsonOrNull(
      ky.get(`${REGISTRY_URL}/package_builds/get`, {
        searchParams: {
          package_build_id: buildId,
          include_logs: true,
        },
      }),
    ).catch((error) => {
      console.warn("Failed to fetch package build for SSR:", error)
      return null
    })
    packageBuild = buildResponse?.package_build ?? null
  }

  return {
    route,
    packageInfo,
    packageRelease,
    packageFiles,
    primaryFile,
    fileArtifacts,
    packageReleases,
    packageBuilds,
    packageBuild,
  }
}

const getPackagePageTitle = (route, packageInfo, packageRelease) => {
  const packageTitle = packageInfo.name
  if (route.kind === "file")
    return `${route.filePath} - ${packageTitle} - tscircuit`
  if (route.kind === "directory") {
    return `${route.filePath || "Files"} - ${packageTitle} - tscircuit`
  }
  if (route.kind === "releases") return `${packageTitle} Releases - tscircuit`
  if (route.kind === "release" || route.kind === "preview") {
    return `${packageTitle} Release ${packageRelease?.version || route.releaseId} - tscircuit`
  }
  if (route.kind === "builds") return `${packageTitle} Builds - tscircuit`
  if (route.kind === "build")
    return `${packageTitle} Build ${route.buildId} - tscircuit`
  if (route.kind === "settings") return `${packageTitle} Settings - tscircuit`
  return `${packageTitle} - tscircuit`
}

async function handlePackagePage(req, res, route) {
  const packageDetails = await requestJsonOrNull(
    ky.get(`${REGISTRY_URL}/packages/get`, {
      searchParams: { name: route.packageNameWithScope },
    }),
  )

  const canonicalPath = req.url.split("?")[0]
  if (!packageDetails?.package) {
    const html = getHtmlWithModifiedSeoTags({
      title: "Package Not Found - tscircuit",
      description: he.encode(
        `The package ${route.packageNameWithScope} could not be found.`,
      ),
      canonicalUrl: `${BASE_URL}${canonicalPath}`,
      ssrContent: `<style>#loader{display:none}</style><main data-ssr-package-page="not-found"><h1>Package Not Found</h1><p>The package ${he.encode(
        route.packageNameWithScope,
      )} could not be found.</p></main>`,
    })
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", cacheControlHeader)
    res.setHeader("Vary", "Accept-Encoding")
    res.status(404).send(html)
    return
  }

  const packageInfo = packageDetails.package
  const data = await fetchPackagePageData(route, packageInfo)
  const description = he.encode(
    `${
      packageInfo.description ||
      packageInfo.ai_description ||
      `A tscircuit package created by ${route.author}`
    } ${packageInfo.ai_usage_instructions ?? ""}`.trim(),
  )
  const title = he.encode(
    getPackagePageTitle(route, packageInfo, data.packageRelease),
  )
  const allowedViews = ["schematic", "pcb", "assembly", "3d"]
  const defaultView = packageInfo.default_view || "3d"
  const thumbnailView = allowedViews.includes(defaultView) ? defaultView : "3d"
  const imageUrl = `${REGISTRY_URL}/packages/images/${encodeURIComponent(
    route.author,
  )}/${encodeURIComponent(route.packageName)}/${thumbnailView}.png?fs_sha=${encodeURIComponent(
    packageInfo.latest_package_release_fs_sha || "",
  )}`
  const ssrContent = renderPackagePageContent(data)
  const html = getHtmlWithModifiedSeoTags({
    title,
    description,
    canonicalUrl: `${BASE_URL}${canonicalPath}`,
    imageUrl,
    ssrContent,
    ssrPackageData: {
      package: packageInfo,
      packageRelease: data.packageRelease,
      packageFiles: data.packageFiles,
      packageFile: route.kind === "file" ? data.primaryFile : null,
      packageFileArtifacts: data.fileArtifacts
        ? Object.values(data.fileArtifacts).filter(Boolean)
        : null,
      packageReleases: data.packageReleases,
      packageBuilds: data.packageBuilds,
      packageBuild: data.packageBuild,
      route,
    },
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function handleCustomPackageHtml(req, res) {
  const parts = req.url.split("?")[0].split("/")
  const [_, author, unscopedPackageName, other] = parts
  if (unscopedPackageName === "settings") {
    throw new Error("Organization settings route")
  }
  if (other === "releases") {
    throw new Error("Release route")
  }
  if (!author || !unscopedPackageName) {
    throw new Error("Invalid author/package URL")
  }
  if (author === "datasheets") {
    throw new Error("Datasheet route")
  }
  if (parts.length > 3) {
    throw new Error("Not a package route")
  }

  const packageNotFoundHtml = getHtmlWithModifiedSeoTags({
    title: "Package Not Found - tscircuit",
    description: `The package ${author}/${unscopedPackageName} could not be found.`,
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
      unscopedPackageName,
    )}`,
  })
  const packageDetails = await ky
    .get(`${REGISTRY_URL}/packages/get`, {
      searchParams: {
        name: `${author}/${unscopedPackageName}`,
      },
    })
    .json()
    .catch((e) => {
      if (String(e).includes("404")) {
        return null
      }
      throw e
    })

  if (!packageDetails) {
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", cacheControlHeader)
    res.setHeader("Vary", "Accept-Encoding")
    res.status(404).send(packageNotFoundHtml)
    return
  }

  const { package: packageInfo } = packageDetails

  let packageRelease = null
  let packageFiles = null
  try {
    const releaseResponse = await ky
      .post(`${REGISTRY_URL}/package_releases/get`, {
        json: {
          package_id: packageInfo.package_id,
          is_latest: true,
        },
      })
      .json()
    packageRelease = releaseResponse.package_release

    // Get package files for the latest release
    if (packageRelease?.package_release_id) {
      try {
        const filesResponse = await ky
          .get(`${REGISTRY_URL}/package_files/list`, {
            searchParams: {
              package_release_id: packageRelease.package_release_id,
            },
          })
          .json()
        packageFiles = filesResponse.package_files || []
      } catch (e) {
        console.warn("Failed to fetch package files:", e)
      }
    }
  } catch (e) {
    console.warn("Failed to fetch package release:", e)
  }

  const description = he.encode(
    `${
      packageInfo.description ||
      packageInfo.ai_description ||
      "A tscircuit component created by " + author
    } ${packageInfo.ai_usage_instructions ?? ""}`,
  )
  const title = he.encode(`${packageInfo.name} - tscircuit`)

  const allowedViews = ["schematic", "pcb", "assembly", "3d"]
  const defaultView = packageInfo.default_view || "3d"
  const thumbnailView = allowedViews.includes(defaultView) ? defaultView : "3d"
  const imageUrl = `${REGISTRY_URL}/packages/images/${he.encode(
    author,
  )}/${he.encode(unscopedPackageName)}/${thumbnailView}.png?fs_sha=${
    packageInfo.latest_package_release_fs_sha
  }`

  const html = getHtmlWithModifiedSeoTags({
    title,
    description,
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
      unscopedPackageName,
    )}`,
    imageUrl,
    ssrPackageData: { package: packageInfo, packageRelease, packageFiles },
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  // Add ETag support for better caching
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function handleOrganizationSettings(req, res) {
  const [_, orgSlug, settings] = req.url.split("?")[0].split("/")
  if (!orgSlug || settings !== "settings") {
    throw new Error("Not an organization settings route")
  }

  const encodedSlugForUrl = encodeURIComponent(orgSlug)
  const title = he.encode(`${orgSlug} Settings - tscircuit`)
  const description = he.encode(
    `Manage the ${orgSlug} organization settings on tscircuit.`,
  )

  const html = getHtmlWithModifiedSeoTags({
    title,
    description,
    canonicalUrl: he.encode(`${BASE_URL}/${encodedSlugForUrl}/settings`),
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function handleOrganizationInvite(req, res) {
  const parts = req.url.split("?")[0].split("/")
  const [_, orgs, invite] = parts

  if (orgs !== "orgs" || invite !== "invite") {
    throw new Error("Not an organization invite route")
  }

  const title = "Organization Invitation - tscircuit"
  const description =
    "Accept your invitation to join an organization on tscircuit."

  const html = getHtmlWithModifiedSeoTags({
    title,
    description,
    canonicalUrl: `${BASE_URL}/orgs/invite`,
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}
async function handleCustomPage(req, res) {
  const [_, page] = req.url.split("?")[0].split("/")

  if (page === "landing" || !page) {
    throw new Error("Use landing.html content")
  }

  if (!PREFETCHABLE_PAGES.has(page)) {
    throw new Error("Not a route that can be prefetched")
  }

  const pageDescription = getPageDescription(page)

  const html = getHtmlWithModifiedSeoTags({
    title: `${page.charAt(0).toUpperCase() + page.slice(1)} - tscircuit`,
    description: pageDescription,
    canonicalUrl: `${BASE_URL}/${page}`,
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function handleReleasePreview(req, res) {
  const parts = req.url.split("?")[0].split("/")
  const [_, author, unscopedPackageName, releasesSegment, releaseId, preview] =
    parts

  if (
    !author ||
    !unscopedPackageName ||
    releasesSegment !== "releases" ||
    !releaseId ||
    preview !== "preview"
  ) {
    throw new Error("Invalid release preview URL")
  }

  const packageDetails = await ky
    .get(`${REGISTRY_URL}/packages/get`, {
      searchParams: {
        name: `${author}/${unscopedPackageName}`,
      },
    })
    .json()
    .catch((e) => {
      if (String(e).includes("404")) {
        return null
      }
      throw e
    })
  const packageNotFoundHtml = getHtmlWithModifiedSeoTags({
    title: "Package Not Found - tscircuit",
    description: `Release for package ${author}/${unscopedPackageName} could not be found.`,
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
      unscopedPackageName,
    )}`,
  })
  if (!packageDetails) {
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", cacheControlHeader)
    res.setHeader("Vary", "Accept-Encoding")
    res.status(404).send(packageNotFoundHtml)
    return
  }

  const { package: packageInfo } = packageDetails
  const title = he.encode(`Release preview for ${packageInfo.name} - tscircuit`)

  const html = getHtmlWithModifiedSeoTags({
    title,
    description: pageDescriptions["releases"],
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
      unscopedPackageName,
    )}/releases/${he.encode(releaseId)}/preview`,
    ssrPackageData: { package: packageInfo },
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function handleReleaseBuilds(req, res) {
  const parts = req.url.split("?")[0].split("/")
  const [_, author, unscopedPackageName, releasesSegment, releaseId, builds] =
    parts

  if (
    !author ||
    !unscopedPackageName ||
    releasesSegment !== "releases" ||
    !releaseId ||
    builds !== "builds"
  ) {
    throw new Error("Invalid release builds URL")
  }

  const packageDetails = await ky
    .get(`${REGISTRY_URL}/packages/get`, {
      searchParams: {
        name: `${author}/${unscopedPackageName}`,
      },
    })
    .json()
    .catch((e) => {
      if (String(e).includes("404")) {
        return null
      }
      throw e
    })

  if (!packageDetails) {
    const packageNotFoundHtml = getHtmlWithModifiedSeoTags({
      title: "Package Not Found - tscircuit",
      description: `Package ${author}/${unscopedPackageName} could not be found.`,
      canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
        unscopedPackageName,
      )}`,
    })
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", cacheControlHeader)
    res.setHeader("Vary", "Accept-Encoding")
    res.status(404).send(packageNotFoundHtml)
    return
  }

  const { package: packageInfo } = packageDetails
  const title = he.encode(
    `${packageInfo.name} Release ${releaseId} Builds - tscircuit`,
  )

  const html = getHtmlWithModifiedSeoTags({
    title,
    description: `View all builds for release ${releaseId} of ${packageInfo.name}.`,
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
      unscopedPackageName,
    )}/releases/${he.encode(releaseId)}/builds`,
    ssrPackageData: { package: packageInfo },
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function handleReleaseDetail(req, res) {
  const parts = req.url.split("?")[0].split("/")
  const [_, author, unscopedPackageName, releasesSegment, releaseId] = parts

  if (
    !author ||
    !unscopedPackageName ||
    releasesSegment !== "releases" ||
    !releaseId ||
    parts.length > 5
  ) {
    throw new Error("Invalid release detail URL")
  }

  const packageDetails = await ky
    .get(`${REGISTRY_URL}/packages/get`, {
      searchParams: {
        name: `${author}/${unscopedPackageName}`,
      },
    })
    .json()
    .catch((e) => {
      if (String(e).includes("404")) {
        return null
      }
      throw e
    })

  if (!packageDetails) {
    const packageNotFoundHtml = getHtmlWithModifiedSeoTags({
      title: "Package Not Found - tscircuit",
      description: `Package ${author}/${unscopedPackageName} could not be found.`,
      canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
        unscopedPackageName,
      )}`,
    })
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", cacheControlHeader)
    res.setHeader("Vary", "Accept-Encoding")
    res.status(404).send(packageNotFoundHtml)
    return
  }

  const { package: packageInfo } = packageDetails
  const title = he.encode(
    `${packageInfo.name} Release ${releaseId} - tscircuit`,
  )

  const html = getHtmlWithModifiedSeoTags({
    title,
    description: `View release of ${packageInfo.name}.`,
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
      unscopedPackageName,
    )}/releases/${he.encode(releaseId)}`,
    ssrPackageData: { package: packageInfo },
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

async function handleReleases(req, res) {
  const parts = req.url.split("?")[0].split("/")
  const [_, author, unscopedPackageName, releasesSegment] = parts

  if (
    !author ||
    !unscopedPackageName ||
    releasesSegment !== "releases" ||
    parts.length > 4
  ) {
    throw new Error("Invalid releases URL")
  }

  const packageDetails = await ky
    .get(`${REGISTRY_URL}/packages/get`, {
      searchParams: {
        name: `${author}/${unscopedPackageName}`,
      },
    })
    .json()
    .catch((e) => {
      if (String(e).includes("404")) {
        return null
      }
      throw e
    })

  if (!packageDetails) {
    const packageNotFoundHtml = getHtmlWithModifiedSeoTags({
      title: "Package Not Found - tscircuit",
      description: `Package ${author}/${unscopedPackageName} could not be found.`,
      canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
        unscopedPackageName,
      )}`,
    })
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", cacheControlHeader)
    res.setHeader("Vary", "Accept-Encoding")
    res.status(404).send(packageNotFoundHtml)
    return
  }

  const { package: packageInfo } = packageDetails
  const title = he.encode(`${packageInfo.name} Releases - tscircuit`)

  const html = getHtmlWithModifiedSeoTags({
    title,
    description: `View all releases of ${packageInfo.name}.`,
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(
      unscopedPackageName,
    )}/releases`,
    ssrPackageData: { package: packageInfo },
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}

export async function handleAvatarRedirect(req, res) {
  const urlPath = req.url.split("?")[0]

  // Check if URL ends with .jpeg
  if (!urlPath.endsWith(".jpeg")) {
    throw new Error("Not an avatar redirect")
  }

  const pathParts = urlPath.split("/")
  const lastPart = pathParts[pathParts.length - 1]
  const username = lastPart.replace(".jpeg", "")

  if (!username) {
    throw new Error("Username not provided")
  }

  const orgData = await ky
    .get(`${REGISTRY_URL}/orgs/get`, {
      searchParams: {
        tscircuit_handle: username,
      },
    })
    .json()

  const { org } = orgData

  if (org.avatar_url) {
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600")
    res.redirect(301, org.avatar_url)
    return
  }

  throw new Error("Avatar not found")
}

export default async function handler(req, res) {
  const urlPath = req.url.split("?")[0]
  if (urlPath === "/api/generated-index") {
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", cacheControlHeader)
    res.setHeader("Vary", "Accept-Encoding")
    res.status(200).send(htmlContent)
    return
  }

  const packageRoute = parsePackagePageRoute(req.url)
  if (packageRoute) {
    await handlePackagePage(req, res, packageRoute)
    return
  }

  const pathParts = req.url.split("?")[0].split("/")

  try {
    await handleAvatarRedirect(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  try {
    await handleReleasePreview(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  try {
    await handleReleaseBuilds(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  try {
    await handleReleaseDetail(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  try {
    await handleReleases(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  try {
    await handleCustomPackageHtml(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  if (pathParts[1] === "datasheets" && pathParts[2]) {
    try {
      await handleDatasheetPage(req, res)
      return
    } catch (e) {
      console.warn(e)
    }
  }

  try {
    await handleOrganizationInvite(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  try {
    await handleOrganizationSettings(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  try {
    await handleCustomPage(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  try {
    await handleUserProfile(req, res)
    return
  } catch (e) {
    console.warn(e)
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(htmlContent)
}
