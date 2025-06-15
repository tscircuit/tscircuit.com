import he from "he"

const cacheControlHeader = "public, max-age=0, must-revalidate"

export async function handleUserProfile(req, res, getHtmlWithModifiedSeoTags) {
  const [_, username] = req.url.split("?")[0].split("/")

  if (!username) {
    throw new Error("Username not provided")
  }

  try {
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
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("GitHub user not found")
    }
    throw error
  }
}
