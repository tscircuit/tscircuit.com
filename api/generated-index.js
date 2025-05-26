// api/generated-index.js
import ky from "ky"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import he from "he"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const normalIndexFile = join(__dirname, "../dist/index.html")
const htmlContent = readFileSync(normalIndexFile, "utf-8")

const cacheControlHeader = "public, max-age=0, must-revalidate"

function getHtmlWithModifiedSeoTags({
  title,
  description,
  canonicalUrl,
  imageUrl,
  ssrPackageData,
}) {
  const seoStartTag = "<!-- SEO_START -->"
  const seoEndTag = "<!-- SEO_END -->"
  const startIndex = htmlContent.indexOf(seoStartTag)
  const endIndex = htmlContent.indexOf(seoEndTag) + seoEndTag.length

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

  let ssrBlock = ""
  if (ssrPackageData) {
    const ssrScript = `<script>window.SSR_PACKAGE = ${JSON.stringify(ssrPackageData)};</script>`
    ssrBlock = `\n<!-- SSR_START -->\n${ssrScript}\n<!-- SSR_END -->`
  }

  return `${htmlContent.substring(0, startIndex)}${seoTags}${ssrBlock}${htmlContent.substring(endIndex)}`
}

async function handleCustomPackageHtml(req, res) {
  // Get the author and package name
  const [_, author, unscopedPackageName] = req.url.split("?")[0].split("/")
  if (!author || !unscopedPackageName) {
    throw new Error("Invalid author/package URL")
  }

  const { package: packageInfo } = await ky
    .get(`https://registry-api.tscircuit.com/packages/get`, {
      searchParams: {
        name: `${author}/${unscopedPackageName}`,
      },
    })
    .json()

  if (!packageInfo) {
    throw new Error("Package not found")
  }

  const description = he.encode(
    `${packageInfo.description || packageInfo.ai_description || "A tscircuit component created by " + author} ${packageInfo.ai_usage_instructions ?? ""}`,
  )
  const title = he.encode(`${packageInfo.name} - tscircuit`)

  const html = getHtmlWithModifiedSeoTags({
    title,
    description,
    canonicalUrl: `https://tscircuit.com/${he.encode(author)}/${he.encode(unscopedPackageName)}`,
    imageUrl: `https://registry-api.tscircuit.com/snippets/images/${he.encode(author)}/${he.encode(unscopedPackageName)}/pcb.png`,
    ssrPackageData: packageInfo,
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

  // TODO handle usernames

  const html = getHtmlWithModifiedSeoTags({
    title: `${page} - tscircuit`,
    description: ``,
    canonicalUrl: `https://tscircuit.com/${page}`,
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  // Add ETag support for better caching
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

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  // Add ETag support for better caching
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(htmlContent)
}
