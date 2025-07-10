// api/generated-index.js
import ky from "ky"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import he from "he"
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
])

const pageDescriptions = {
  landing:
    "Build electronics with code, AI, and drag'n'drop tools. Render code into schematics, PCBs, 3D, fabrication files, and more. Open-source MIT licensed electronic design automation tool.",
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
  let modifiedHtml = `${htmlContent.substring(0, seoStartIndex)}${seoTags}${htmlContent.substring(seoEndIndex)}`

  // Then handle SSR data injection
  if (ssrPackageData) {
    const ssrStartTag = "<!-- SSR_START -->"
    const ssrEndTag = "<!-- SSR_END -->"
    const {
      package: packageData,
      packageRelease,
      packageFiles,
    } = ssrPackageData

    const assignments = []
    if (packageData) {
      assignments.push(`window.SSR_PACKAGE = ${JSON.stringify(packageData)};`)
    }
    if (packageRelease) {
      assignments.push(
        `window.SSR_PACKAGE_RELEASE = ${JSON.stringify(packageRelease)};`,
      )
    }
    if (packageFiles) {
      assignments.push(
        `window.SSR_PACKAGE_FILES = ${JSON.stringify(packageFiles)};`,
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

  return modifiedHtml
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

async function handleCustomPackageHtml(req, res) {
  // Get the author and package name
  const [_, author, unscopedPackageName] = req.url.split("?")[0].split("/")
  if (!author || !unscopedPackageName) {
    throw new Error("Invalid author/package URL")
  }

  const packageNotFoundHtml = getHtmlWithModifiedSeoTags({
    title: "Package Not Found - tscircuit",
    description: `The package ${author}/${unscopedPackageName} could not be found.`,
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(unscopedPackageName)}`,
  })
  let packageInfo
  try {
    const response = await ky
      .get(`${REGISTRY_URL}/packages/get`, {
        searchParams: {
          name: `${author}/${unscopedPackageName}`,
        },
      })
      .json()
    packageInfo = response.package
  } catch (error) {
    if (error.response?.status === 404) {
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.setHeader("Cache-Control", cacheControlHeader)
      res.setHeader("Vary", "Accept-Encoding")
      res.status(404).send(packageNotFoundHtml)
      return
    }
    throw error
  }

  if (!packageInfo) {
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", cacheControlHeader)
    res.setHeader("Vary", "Accept-Encoding")
    res.status(404).send(packageNotFoundHtml)
    return
  }

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
          .post(`${REGISTRY_URL}/package_files/list`, {
            json: {
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
    `${packageInfo.description || packageInfo.ai_description || "A tscircuit component created by " + author} ${packageInfo.ai_usage_instructions ?? ""}`,
  )
  const title = he.encode(`${packageInfo.name} - tscircuit`)

  const allowedViews = ["schematic", "pcb", "assembly", "3d"]
  const defaultView = packageInfo.default_view || "pcb"
  const thumbnailView = allowedViews.includes(defaultView) ? defaultView : "pcb"
  const imageUrl = `${REGISTRY_URL}/packages/images/${he.encode(author)}/${he.encode(unscopedPackageName)}/${thumbnailView}.png?fs_sha=${packageInfo.latest_package_release_fs_sha}`

  const html = getHtmlWithModifiedSeoTags({
    title,
    description,
    canonicalUrl: `${BASE_URL}/${he.encode(author)}/${he.encode(unscopedPackageName)}`,
    imageUrl,
    ssrPackageData: { package: packageInfo, packageRelease, packageFiles },
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  // Add ETag support for better caching
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

export default async function handler(req, res) {
  try {
    await handleCustomPackageHtml(req, res)
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
  // Add ETag support for better caching
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(htmlContent)
}
