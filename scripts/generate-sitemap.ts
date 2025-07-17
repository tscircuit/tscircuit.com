import fs from "fs"
import path from "path"
import { Readable } from "stream"
import { SitemapStream, streamToPromise } from "sitemap"

const staticRoutes = [
  { url: "/", changefreq: "weekly", priority: 1.0 },
  { url: "/editor", changefreq: "weekly", priority: 0.9 },
  { url: "/playground", changefreq: "weekly", priority: 0.9 },
  { url: "/quickstart", changefreq: "monthly", priority: 0.8 },
  { url: "/dashboard", changefreq: "weekly", priority: 0.7 },
  { url: "/latest", changefreq: "daily", priority: 0.8 },
  { url: "/search", changefreq: "weekly", priority: 0.7 },
  { url: "/settings", changefreq: "monthly", priority: 0.6 },
  { url: "/community/join-redirect", changefreq: "monthly", priority: 0.6 },
  { url: "/legal/terms-of-service", changefreq: "yearly", priority: 0.3 },
  { url: "/legal/privacy-policy", changefreq: "yearly", priority: 0.3 },
]

async function fetchTrendingSnippets() {
  try {
    const response = await fetch(
      "https://registry-api.tscircuit.com/snippets/list_trending",
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const text = await response.text()
    try {
      const data = JSON.parse(text)
      return data.snippets || []
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      console.error("Raw response:", text)
      return []
    }
  } catch (error) {
    console.error("Error fetching trending snippets:", error)
    return []
  }
}

async function generateSitemap() {
  try {
    const stream = new SitemapStream({
      hostname: "https://tscircuit.com",
      xmlns: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
      },
    })

    const trendingSnippets = await fetchTrendingSnippets()

    const links = [
      ...staticRoutes,
      ...trendingSnippets.map((snippet: any) => ({
        url: `/${snippet.owner_name}/${snippet.unscoped_name}`,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: new Date(
          snippet.updated_at || snippet.created_at,
        ).toISOString(),
      })),
    ]

    const sitemap = await streamToPromise(Readable.from(links).pipe(stream))

    const formattedXml = sitemap
      .toString()
      .replace(/></g, ">\n<")
      .split("\n")
      .map((line) => line.trim())
      .map((line, i) => {
        if (i === 0) return line
        if (line.startsWith("</")) return "  " + line
        if (line.startsWith("<urlset")) return line
        if (line.startsWith("</urlset>")) return line
        if (line.startsWith("<url>")) return "  " + line
        if (line.startsWith("</url>")) return "  " + line
        return "    " + line
      })
      .join("\n")

    const outputPath = path.join(process.cwd(), "public", "sitemap.xml")
    fs.writeFileSync(outputPath, formattedXml, "utf-8")

    console.log("Sitemap generated successfully at", outputPath)
  } catch (error) {
    console.error("Error generating sitemap:", error)
    process.exit(1)
  }
}

generateSitemap().catch(console.error)
