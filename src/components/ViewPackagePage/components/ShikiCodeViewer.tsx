import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useEffect, useMemo } from "react"
import { useQuery } from "react-query"

export const ShikiCodeViewer = ({
  code,
  filePath,
}: { code: string; filePath: string }) => {
  const { highlighter } = useShikiHighlighter()

  const html = useMemo(
    () =>
      highlighter?.codeToHtml(code, {
        lang: "tsx",
        theme: "vitesse-light",
      }),
    [filePath, code, highlighter],
  )

  if (!html) {
    return <div>Loading...</div>
  }

  return (
    <div className="text-sm shiki" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
