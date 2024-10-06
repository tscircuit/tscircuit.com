import { ReadableStream } from "stream/web"

export default async (req: Request) => {
  const url = new URL(req.url)
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicApiKey) {
    return new Response("Anthropic API key is not set", { status: 500 })
  }

  const anthropicUrl =
    "https://api.anthropic.com" + url.pathname.replace(/^\/api\/ai/, "")

  const headers = new Headers(req.headers)
  headers.set("x-api-key", `${anthropicApiKey}`)
  headers.set("Accept", "text/event-stream")
  headers.set("Cache-Control", "no-cache")
  headers.set("Connection", "keep-alive")

  console.log("sending request to anthropic")
  const response = await fetch(anthropicUrl, {
    method: req.method,
    headers: headers,
    body: req.body,
    // @ts-ignore
    duplex: "half",
  })

  // Check if the response is successful
  if (!response.ok) {
    return new Response(
      `Anthropic API returned an error: ${response.status} ${response.statusText}`,
      {
        status: response.status,
      },
    )
  }

  // Create a ReadableStream to process the response
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(value)
        }
      } finally {
        reader.releaseLock()
        controller.close()
      }
    },
  })

  // Return a streaming response
  return new Response(stream as any, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
