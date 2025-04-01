import { useEffect } from "react"
import { useQuery } from "react-query"
import { createHighlighter, Highlighter } from "shiki"

let globalHighlighter$: any
let globalHighlighter: Highlighter

const fileExtensionsToLanguages = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
}

export const ShikiCodeViewer = ({
  code,
  filePath,
}: { code: string; filePath: string }) => {
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

  const html = globalHighlighter?.codeToHtml(code, {
    lang:
      fileExtensionsToLanguages[
        filePath.split(".").pop() as keyof typeof fileExtensionsToLanguages
      ] || "typescript",
    theme: "vitesse-light",
  })

  if (!html) {
    return <div>Loading...</div>
  }

  return (
    <div className="text-sm shiki" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
