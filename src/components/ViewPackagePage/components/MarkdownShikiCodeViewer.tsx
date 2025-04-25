import { useEffect, useMemo } from "react"
import { createHighlighter, Highlighter } from "shiki"

let globalHighlighter$: any
let globalHighlighter: Highlighter

const fileExtensionsToLanguages: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
}

export const MarkdownShikiCodeViewer = ({
  code,
  language,
}: {
  code: string
  language: string
}) => {
  useEffect(() => {
    async function setupHighlighter() {
      if (globalHighlighter$) return
      globalHighlighter$ = await createHighlighter({
        langs: ["typescript"],
        themes: ["vitesse-light"],
      })
      globalHighlighter = await globalHighlighter$
    }
    setupHighlighter()
  }, [])

  const html = useMemo(
    () =>
      globalHighlighter?.codeToHtml(code, {
        lang: fileExtensionsToLanguages[language] || "typescript",
        theme: "vitesse-light",
      }),
    [language, code, globalHighlighter],
  )

  if (!html) {
    return <div>Loading...</div>
  }

  let processedHtml = html
    .replace(/<span class="line-number">.*?<\/span>/g, "")
    .replace(/<div class="line-number">.*?<\/div>/g, "")
    .replace(/data-line="[^"]*"/g, "")
    .replace(
      /style="background-color:(.*?)"/g,
      'style="background-color:#f3f4f6"',
    )

  processedHtml = processedHtml.replace(
    /class="shiki/g,
    'class="shiki markdown-shiki-code',
  )

  return (
    <div
      className="text-sm rounded overflow-auto w-full bg-gray-100 dark:bg-gray-800"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  )
}
