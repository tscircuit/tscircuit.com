import { useEffect, useState } from "react"
import { type HighlighterCore, createHighlighterCore } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"

let cachedHighlighter: HighlighterCore | null = null

export const useShikiHighlighter = () => {
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHighlighter = async () => {
      if (!cachedHighlighter) {
        cachedHighlighter = await createHighlighterCore({
          themes: [
            import("@shikijs/themes/github-dark"),
            import("@shikijs/themes/github-light"),
            import("@shikijs/themes/vitesse-light"),
          ],
          langs: [import("@shikijs/langs/tsx")],
          // `shiki/wasm` contains the wasm binary inlined as base64 string.
          engine: createOnigurumaEngine(import("shiki/wasm")),
        })
      }
      setHighlighter(cachedHighlighter)
      setIsLoading(false)
    }

    fetchHighlighter()
  }, [])

  return { highlighter, isLoading }
}
