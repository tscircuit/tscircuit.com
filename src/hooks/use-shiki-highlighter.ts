import { useState, useEffect } from "react"
import { getSingletonHighlighter, Highlighter } from "shiki"

let cachedHighlighter: Highlighter | null = null

export const useShikiHighlighter = () => {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHighlighter = async () => {
      if (!cachedHighlighter) {
        cachedHighlighter = await getSingletonHighlighter({
          themes: ["github-dark", "github-light"],
          langs: ["typescript", "tsx"],
        })
      }
      setHighlighter(cachedHighlighter)
      setIsLoading(false)
    }

    fetchHighlighter()
  }, [])

  return { highlighter, isLoading }
}
