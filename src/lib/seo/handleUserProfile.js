import he from "he"
import { cacheControlHeader } from "../../../api/generated-index"

export async function handleUserProfile(req, res, getHtmlWithModifiedSeoTags) {
  const [_, username] = req.url.split("?")[0].split("/")

  if (!username) {
    throw new Error("Username not provided")
  }

  const description = he.encode(
    `Discover the circuits created by ${username} on tscircuit`,
  )

  const title = he.encode(`${username} - tscircuit`)

  const html = getHtmlWithModifiedSeoTags({
    title,
    description,
    canonicalUrl: `https://tscircuit.com/${he.encode(username)}`,
    imageUrl: `https://github.com/${username}.png`,
  })

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.setHeader("Cache-Control", cacheControlHeader)
  res.setHeader("Vary", "Accept-Encoding")
  res.status(200).send(html)
}
